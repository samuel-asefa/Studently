import { writable, derived, readable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { auth, db } from './firebase.js';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { uid, clamp } from './utils/id.js';
import { isISODate, todayISO, toISO, addDays, startOfDay } from './utils/date.js';
import { buildPlan } from './utils/scheduler.js';
import { registerHues, pickHue, SERIES_HUES } from './constants.js';
import { computeFacts, computeAchievements, computeInsights } from './insights.js';
import { toast } from './ui.js';

/* ==========================================================================
   Settings (per device)
   ========================================================================== */

export const DEFAULT_SETTINGS = {
	theme: 'system', // 'system' | 'light' | 'dark'
	accent: 'blue',
	font: 'Geist',
	effects: true,
	reduceMotion: false,
	sound: true,
	dailyHours: 4,
	focusMinutes: 25,
	shortBreak: 5,
	longBreak: 15,
	autoBreak: false,
	name: ''
};

function readLocal(key) {
	if (!browser) return undefined;
	try {
		const raw = localStorage.getItem(key);
		return raw == null ? undefined : JSON.parse(raw);
	} catch {
		return localStorage.getItem(key) ?? undefined;
	}
}

function writeLocal(key, value) {
	if (!browser) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		/* storage full or blocked */
	}
}

export function persisted(key, initial, { merge = false } = {}) {
	const stored = readLocal(key);
	const value =
		stored === undefined ? initial : merge && typeof stored === 'object' ? { ...initial, ...stored } : stored;
	const store = writable(value);
	if (browser) store.subscribe((v) => writeLocal(key, v));
	return store;
}

function initialSettings() {
	const s = { ...DEFAULT_SETTINGS };
	// Carry over the old standalone theme/font keys.
	const oldTheme = readLocal('theme');
	const oldFont = readLocal('font');
	if (oldTheme === 'light' || oldTheme === 'dark') s.theme = oldTheme;
	if (typeof oldFont === 'string' && oldFont) s.font = oldFont === 'Roboto' ? 'Inter' : oldFont;
	return s;
}

export const settings = persisted('studently:settings', initialSettings(), { merge: true });

/* ==========================================================================
   Auth + data
   ========================================================================== */

export const DEFAULT_CATEGORIES = { Work: '#3b82f6', Study: '#10b981', Personal: '#ef4444' };
const DEADLINE_TYPES = ['assignment', 'exam', 'project', 'ec', 'other'];
const GUEST_KEY = 'studently:guest-data';
const MAX_SESSIONS = 1500;

export const user = writable(null);
export const authReady = writable(false);
export const dataReady = writable(false);
export const guest = persisted('studently:guest', false);
/** 'idle' | 'saving' | 'saved' | 'error' | 'local' */
export const syncState = writable('idle');

export const categories = writable(/** @type {Record<string, string>} */ ({ ...DEFAULT_CATEGORIES }));
export const tasks = writable([]);
export const deadlines = writable([]);
// Keep chart colors in sync before any component reads them.
deadlines.subscribe(registerHues);
export const sessions = writable([]);

/** @type {Record<string, import('svelte/store').Writable<any>>} */
const STORES = { categories, tasks, deadlines, sessions };

/* ---------- Normalizing (old data had no ids, numeric ids, etc.) ---------- */

let migrated = false;

function normCategories(c) {
	if (!c || typeof c !== 'object' || Array.isArray(c)) return { ...DEFAULT_CATEGORIES };
	const out = {};
	for (const [k, v] of Object.entries(c)) if (k && typeof v === 'string') out[k] = v;
	return out;
}

function normTasks(list) {
	if (!Array.isArray(list)) return [];
	return list.filter(Boolean).map((t) => {
		if (t.id == null || typeof t.id !== 'string') migrated = true;
		return {
			id: t.id != null ? String(t.id) : uid(),
			name: String(t.name ?? '').slice(0, 500),
			category: typeof t.category === 'string' ? t.category : '',
			done: !!t.done,
			createdAt: Number(t.createdAt) || Date.now(),
			completedAt: t.completedAt ?? null
		};
	});
}

function normDeadlines(list) {
	if (!Array.isArray(list)) return [];
	const out = [];
	for (const d of list.filter(Boolean)) {
		if (d.id == null || typeof d.id !== 'string') migrated = true;
		const validHue = SERIES_HUES.includes(d.hue);
		if (!validHue) migrated = true;
		out.push({
			id: d.id != null ? String(d.id) : uid(),
			name: String(d.name ?? 'Untitled').slice(0, 300),
			type: DEADLINE_TYPES.includes(d.type) ? d.type : 'other',
			dueDate: isISODate(d.dueDate) ? d.dueDate : todayISO(),
			estimatedHours: clamp(Number(d.estimatedHours) || 1, 0.25, 500),
			customWeight: clamp(Number(d.customWeight) || 1, 0.5, 3),
			hoursSpent: Math.max(0, Number(d.hoursSpent) || 0),
			completed: !!d.completed,
			completedAt: d.completedAt ?? null,
			createdAt: Number(d.createdAt) || Number(d.id) || Date.now(),
			notes: String(d.notes ?? ''),
			hue: validHue ? d.hue : pickHue(out),
			template: typeof d.template === 'string' ? d.template : null,
			group: typeof d.group === 'string' ? d.group : null
		});
	}
	return out;
}

function normSessions(list) {
	if (!Array.isArray(list)) return [];
	return list
		.filter((s) => s && Number(s.minutes) > 0)
		.map((s) => ({
			id: String(s.id ?? uid()),
			at: Number(s.at) || Date.now(),
			minutes: Math.round(Number(s.minutes) * 10) / 10,
			deadlineId: s.deadlineId != null ? String(s.deadlineId) : null
		}))
		.slice(-MAX_SESSIONS);
}

const NORMALIZERS = {
	categories: normCategories,
	tasks: normTasks,
	deadlines: normDeadlines,
	sessions: normSessions
};

/* ---------- Sync engine ---------- */

let applying = false; // true while loading remote/local data, so it is not saved back
let currentUid = null;
let unsubscribeDoc = null;
let pending = {};
let saveTimer = null;
let guestTimer = null;

function snapshot() {
	return {
		categories: get(categories),
		tasks: get(tasks),
		deadlines: get(deadlines),
		sessions: get(sessions)
	};
}

function hasContent(d) {
	return !!d && (d.tasks?.length > 0 || d.deadlines?.length > 0 || d.sessions?.length > 0);
}

/** Load data into the stores without triggering saves. Skips unchanged fields. */
function applyData(data = {}, { skip = [] } = {}) {
	applying = true;
	try {
		for (const [field, store] of Object.entries(STORES)) {
			if (skip.includes(field)) continue;
			const next = NORMALIZERS[field](data?.[field]);
			if (JSON.stringify(next) !== JSON.stringify(get(store))) store.set(next);
		}
	} finally {
		applying = false;
	}
}

function readGuest() {
	const g = readLocal(GUEST_KEY);
	return g && typeof g === 'object' ? g : null;
}

function queueSave(field, value) {
	if (!browser || applying) return;
	if (currentUid) {
		pending[field] = value;
		syncState.set('saving');
		clearTimeout(saveTimer);
		saveTimer = setTimeout(flush, 600);
	} else if (get(guest)) {
		clearTimeout(guestTimer);
		guestTimer = setTimeout(() => writeLocal(GUEST_KEY, snapshot()), 150);
	}
}

async function flush() {
	const id = currentUid;
	const payload = pending;
	pending = {};
	if (!id || Object.keys(payload).length === 0) return;
	try {
		await setDoc(doc(db, 'users', id), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
		if (Object.keys(pending).length === 0) syncState.set('saved');
	} catch (err) {
		console.error('Save failed', err);
		pending = { ...payload, ...pending };
		syncState.set('error');
		clearTimeout(saveTimer);
		saveTimer = setTimeout(flush, 5000);
	}
}

function pushAll() {
	pending = snapshot();
	clearTimeout(saveTimer);
	saveTimer = setTimeout(flush, 50);
}

function subscribeToUser(u) {
	const ref = doc(db, 'users', u.uid);
	let first = true;
	const fallback = setTimeout(() => dataReady.set(true), 8000);

	unsubscribeDoc = onSnapshot(
		ref,
		// Metadata changes are needed to hear "doc confirmed missing on server" for new users.
		{ includeMetadataChanges: true },
		(/** @type {any} */ snap) => {
			if (snap.metadata.hasPendingWrites) return; // our own write echoing back
			if (first) {
				// A missing doc in the offline cache may still exist on the server.
				if (!snap.exists() && snap.metadata.fromCache) return;
				first = false;
				clearTimeout(fallback);
				migrated = false;
				const data = snap.exists() ? snap.data() : null;
				const local = readGuest();
				if (!hasContent(data) && hasContent(local)) {
					applyData({ ...local, categories: { ...(data?.categories ?? {}), ...normCategories(local.categories) } });
					pushAll();
					localStorage.removeItem(GUEST_KEY);
					toast('Your guest work was moved into your account.', { tone: 'success' });
				} else {
					applyData(data ?? {});
					if (!snap.exists() || migrated) pushAll();
				}
				guest.set(false);
				dataReady.set(true);
				syncState.set('saved');
				return;
			}
			if (snap.exists()) applyData(snap.data(), { skip: Object.keys(pending) });
		},
		(err) => {
			console.error('Sync error', err);
			syncState.set('error');
			dataReady.set(true);
		}
	);
}

if (browser) {
	// Guest data must load before the stores start saving, or it would be overwritten.
	if (get(guest)) {
		applyData(readGuest() ?? {});
		syncState.set('local');
	}

	for (const [field, store] of Object.entries(STORES)) {
		store.subscribe((value) => queueSave(field, value));
	}

	onAuthStateChanged(auth, (u) => {
		unsubscribeDoc?.();
		unsubscribeDoc = null;
		clearTimeout(saveTimer);
		pending = {};

		if (u) {
			currentUid = u.uid;
			dataReady.set(false);
			subscribeToUser(u);
		} else {
			currentUid = null;
			applyData(get(guest) ? (readGuest() ?? {}) : {});
			syncState.set(get(guest) ? 'local' : 'idle');
			dataReady.set(true);
		}
		user.set(u);
		authReady.set(true);
	});

	window.addEventListener('beforeunload', () => {
		if (Object.keys(pending).length) flush();
	});
}

export function startGuest() {
	guest.set(true);
	applyData(readGuest() ?? {});
	syncState.set('local');
	dataReady.set(true);
}

export function leaveGuest() {
	writeLocal(GUEST_KEY, snapshot());
	guest.set(false);
}

/** Replace all data (import / demo / reset). */
export function replaceAll(data) {
	const next = {
		categories: normCategories(data.categories),
		tasks: normTasks(data.tasks),
		deadlines: normDeadlines(data.deadlines),
		sessions: normSessions(data.sessions)
	};
	for (const [field, store] of Object.entries(STORES)) store.set(next[field]);
}

/* ==========================================================================
   Derived
   ========================================================================== */

/** Ticks at midnight so "today" based views refresh. */
export const today = readable(todayISO(), (set) => {
	let timer;
	const schedule = () => {
		const next = addDays(startOfDay(), 1).getTime() - Date.now() + 1000;
		timer = setTimeout(() => {
			set(todayISO());
			schedule();
		}, next);
	};
	schedule();
	return () => clearTimeout(timer);
});

export const plan = derived([deadlines, settings, sessions, today], ([$d, $s, $sessions, $today]) => {
	const usedToday = $sessions.filter((x) => toISO(new Date(x.at)) === $today).reduce((n, x) => n + x.minutes, 0) / 60;
	return buildPlan($d, { dailyHours: $s.dailyHours, usedToday });
});

export const displayName = derived([user, settings], ([$u, $s]) => {
	if ($s.name) return $s.name;
	if ($u?.displayName) return $u.displayName.split(' ')[0];
	if ($u?.email) {
		const n = $u.email.split('@')[0].split(/[._-]/)[0];
		return n.charAt(0).toUpperCase() + n.slice(1);
	}
	return '';
});

export const stats = derived([tasks, deadlines, sessions, today], ([$t, $d, $s, $today]) => {
	const dayOf = (ms) => toISO(new Date(ms));

	const focusByDay = new Map();
	for (const s of $s) focusByDay.set(dayOf(s.at), (focusByDay.get(dayOf(s.at)) ?? 0) + s.minutes);

	const activeDays = new Set(focusByDay.keys());
	for (const t of $t) if (t.done && t.completedAt) activeDays.add(dayOf(t.completedAt));
	for (const d of $d) if (d.completed && d.completedAt) activeDays.add(dayOf(d.completedAt));

	// Streak: consecutive active days ending today (or yesterday, so it survives the morning).
	let streak = 0;
	let cursor = startOfDay();
	if (!activeDays.has(toISO(cursor))) cursor = addDays(cursor, -1);
	while (activeDays.has(toISO(cursor))) {
		streak++;
		cursor = addDays(cursor, -1);
	}

	const week = Array.from({ length: 7 }, (_, i) => {
		const iso = toISO(addDays(startOfDay(), i - 6));
		return { date: iso, minutes: Math.round(focusByDay.get(iso) ?? 0), active: activeDays.has(iso) };
	});

	const activeTasks = $t.filter((t) => !t.done);
	const doneToday = $t.filter((t) => t.done && t.completedAt && dayOf(t.completedAt) === $today);
	const upcoming = $d
		.filter((d) => !d.completed)
		.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || b.customWeight - a.customWeight);

	return {
		streak,
		week,
		weekMinutes: week.reduce((s, d) => s + d.minutes, 0),
		focusToday: focusByDay.get($today) ?? 0,
		sessionsToday: $s.filter((s) => dayOf(s.at) === $today),
		activeTasks: activeTasks.length,
		totalTasks: $t.length,
		doneTasks: $t.length - activeTasks.length,
		doneToday: doneToday.length,
		upcoming,
		nextDeadline: upcoming.find((d) => d.dueDate >= $today) ?? null,
		overdue: upcoming.filter((d) => d.dueDate < $today).length
	};
});

/** Raw counts behind achievements and Insights. */
export const facts = derived([tasks, deadlines, sessions, categories, today], ([$t, $d, $s, $c]) =>
	computeFacts({ tasks: $t, deadlines: $d, sessions: $s, categories: $c })
);

export const achievements = derived(facts, ($f) => computeAchievements($f));

export const insights = derived([deadlines, sessions, today], ([$d, $s]) =>
	computeInsights({ deadlines: $d, sessions: $s })
);
