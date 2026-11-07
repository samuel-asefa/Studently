import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { persisted, settings, deadlines } from './stores.js';
import { addSession, logTime } from './actions.js';
import { toast } from './ui.js';
import { chime, unlockAudio } from './utils/sound.js';
import { confetti } from './utils/confetti.js';
import { formatHours } from './utils/date.js';

export const MODES = {
	focus: { label: 'Focus', setting: 'focusMinutes' },
	short: { label: 'Short break', setting: 'shortBreak' },
	long: { label: 'Long break', setting: 'longBreak' }
};

const IDLE = { status: 'idle', endsAt: null, remainingMs: null, durationMs: null, startedAt: null };

export const timer = persisted(
	'studently:timer',
	{ mode: 'focus', deadlineId: null, round: 0, ...IDLE },
	{ merge: true }
);

export const clock = writable(Date.now());

const durationFor = (mode, s = get(settings)) => Math.max(1, Number(s[MODES[mode].setting]) || 25) * 60_000;

export const remaining = derived([timer, clock, settings], ([$t, $c, $s]) => {
	if ($t.status === 'running') return Math.min($t.durationMs ?? Infinity, Math.max(0, $t.endsAt - $c));
	if ($t.status === 'paused') return $t.remainingMs;
	return durationFor($t.mode, $s);
});

export const progress = derived([timer, remaining, settings], ([$t, $r, $s]) => {
	const total = $t.durationMs ?? durationFor($t.mode, $s);
	return total ? 1 - $r / total : 0;
});

let interval = null;

function tick() {
	clock.set(Date.now());
	const t = get(timer);
	if (t.status === 'running' && Date.now() >= t.endsAt) complete(true);
}

function startTicking() {
	if (interval || !browser) return;
	interval = setInterval(tick, 250);
}

function stopTicking() {
	clearInterval(interval);
	interval = null;
	clock.set(Date.now());
}

export function start() {
	unlockAudio();
	const t = get(timer);
	if (t.status === 'running') return;
	const now = Date.now();
	clock.set(now); // avoid a stale clock showing more than the full duration
	if (t.status === 'paused') {
		timer.set({ ...t, status: 'running', endsAt: now + t.remainingMs, remainingMs: null });
	} else {
		const dur = durationFor(t.mode);
		timer.set({ ...t, status: 'running', endsAt: now + dur, durationMs: dur, startedAt: now });
	}
	startTicking();
}

export function pause() {
	const t = get(timer);
	if (t.status !== 'running') return;
	timer.set({ ...t, status: 'paused', remainingMs: Math.max(0, t.endsAt - Date.now()), endsAt: null });
	stopTicking();
}

export const toggle = () => (get(timer).status === 'running' ? pause() : start());

export function reset() {
	timer.update((t) => ({ ...t, ...IDLE }));
	stopTicking();
}

export function setMode(mode) {
	timer.update((t) => ({ ...t, ...IDLE, mode }));
	stopTicking();
}

export function setDeadline(id) {
	timer.update((t) => ({ ...t, deadlineId: id || null }));
}

/** Finish now: a focus round logs the time spent so far. A break just ends. */
export function finishEarly() {
	const t = get(timer);
	if (t.status === 'idle') {
		if (t.mode !== 'focus') setMode('focus');
		return;
	}
	complete(false);
}

function complete(natural) {
	const t = get(timer);
	stopTicking();
	const s = get(settings);

	if (t.mode === 'focus') {
		const elapsedMs = natural
			? t.durationMs
			: t.durationMs - (t.status === 'paused' ? t.remainingMs : Math.max(0, t.endsAt - Date.now()));
		const minutes = Math.round(elapsedMs / 60_000);
		const round = t.round + 1;
		const next = round % 4 === 0 ? 'long' : 'short';
		timer.set({ ...t, ...IDLE, mode: next, round });

		if (minutes >= 1) {
			addSession(minutes, t.deadlineId);
			const dl = t.deadlineId ? get(deadlines).find((d) => d.id === t.deadlineId) : null;
			if (dl) logTime(dl.id, minutes / 60);
			toast(
				dl
					? `${formatHours(minutes / 60)} logged to “${dl.name}”. Take a breather.`
					: `${formatHours(minutes / 60)} of focus logged. Take a breather.`,
				{ tone: 'success' }
			);
			if (natural) confetti({ count: 140, spread: 90 });
		} else {
			toast('Session too short to log.');
		}
		if (s.sound && natural) chime('done');
		notify('Focus session complete', 'Time for a break.');
		if (s.autoBreak && natural) start();
	} else {
		timer.set({ ...t, ...IDLE, mode: 'focus' });
		if (s.sound && natural) chime('break');
		if (natural) {
			toast('Break’s over. Ready for another round?');
			notify('Break over', 'Ready for another focus round?');
		}
	}
}

function notify(title, body) {
	if (!browser || !('Notification' in window) || Notification.permission !== 'granted') return;
	if (document.visibilityState === 'visible') return;
	try {
		new Notification(title, { body, icon: '/favicon.svg', silent: true });
	} catch {
		/* not supported in this context */
	}
}

// Resume after reload, or finish a session that ended while the tab was closed.
if (browser) {
	const t = get(timer);
	if (t.status === 'running') {
		if (Date.now() >= t.endsAt) setTimeout(() => complete(true), 500);
		else startTicking();
	}
}
