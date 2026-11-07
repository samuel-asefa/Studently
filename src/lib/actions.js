import { get } from 'svelte/store';
import { tasks, deadlines, categories, sessions, settings } from './stores.js';
import { uid, clamp } from './utils/id.js';
import { todayISO } from './utils/date.js';
import { toast } from './ui.js';
import { pickHue } from './constants.js';
import { confetti } from './utils/confetti.js';
import { pop } from './utils/sound.js';

const celebrate = (from) => {
	confetti({ from, count: 50, spread: 60, power: 0.7 });
	if (get(settings).sound) pop();
};

/* ---------- Tasks ---------- */

export function addTask(name, category = '') {
	const trimmed = name.trim();
	if (!trimmed) return null;
	const task = {
		id: uid(),
		name: trimmed,
		category,
		done: false,
		createdAt: Date.now(),
		completedAt: null
	};
	tasks.update((list) => [task, ...list]);
	return task;
}

export function toggleTask(id, from) {
	let nowDone = false;
	tasks.update((list) =>
		list.map((t) => {
			if (t.id !== id) return t;
			nowDone = !t.done;
			return { ...t, done: nowDone, completedAt: nowDone ? Date.now() : null };
		})
	);
	if (nowDone) celebrate(from);
}

export function updateTask(id, patch) {
	tasks.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export function deleteTask(id) {
	const list = get(tasks);
	const index = list.findIndex((t) => t.id === id);
	if (index < 0) return;
	const removed = list[index];
	tasks.set(list.filter((t) => t.id !== id));
	toast(`Deleted “${removed.name}”`, {
		action: {
			label: 'Undo',
			run: () =>
				tasks.update((l) => {
					const copy = [...l];
					copy.splice(Math.min(index, copy.length), 0, removed);
					return copy;
				})
		}
	});
}

export function clearCompleted() {
	const before = get(tasks);
	const done = before.filter((t) => t.done);
	if (!done.length) return;
	tasks.set(before.filter((t) => !t.done));
	toast(`Cleared ${done.length} completed task${done.length === 1 ? '' : 's'}`, {
		action: { label: 'Undo', run: () => tasks.set(before) }
	});
}

/* ---------- Deadlines ---------- */

export function addDeadline(fields) {
	const name = (fields.name ?? '').trim();
	if (!name) return null;
	const d = {
		id: uid(),
		name,
		type: fields.type ?? 'assignment',
		dueDate: fields.dueDate ?? todayISO(),
		estimatedHours: clamp(Number(fields.estimatedHours) || 2, 0.25, 500),
		customWeight: clamp(Number(fields.customWeight) || 1, 0.5, 3),
		hoursSpent: 0,
		completed: false,
		completedAt: null,
		createdAt: Date.now(),
		notes: fields.notes ?? '',
		hue: pickHue(get(deadlines))
	};
	deadlines.update((list) => [...list, d]);
	return d;
}

export function updateDeadline(id, patch) {
	deadlines.update((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
}

export function toggleDeadline(id, from) {
	let nowDone = false;
	let name = '';
	deadlines.update((list) =>
		list.map((d) => {
			if (d.id !== id) return d;
			nowDone = !d.completed;
			name = d.name;
			return { ...d, completed: nowDone, completedAt: nowDone ? Date.now() : null };
		})
	);
	if (nowDone) {
		confetti({ from, count: 120, spread: 80 });
		if (get(settings).sound) pop();
		toast(`“${name}” is done. Nice work!`, { tone: 'success' });
	}
}

export function deleteDeadline(id) {
	const list = get(deadlines);
	const index = list.findIndex((d) => d.id === id);
	if (index < 0) return;
	const removed = list[index];
	deadlines.set(list.filter((d) => d.id !== id));
	toast(`Deleted “${removed.name}”`, {
		action: {
			label: 'Undo',
			run: () =>
				deadlines.update((l) => {
					const copy = [...l];
					copy.splice(Math.min(index, copy.length), 0, removed);
					return copy;
				})
		}
	});
}

/** Add (or with a negative number, remove) hours of progress on a deadline. */
export function logTime(id, hours) {
	deadlines.update((list) =>
		list.map((d) =>
			d.id === id
				? { ...d, hoursSpent: Math.max(0, Math.round((d.hoursSpent + hours) * 100) / 100) }
				: d
		)
	);
}

/* ---------- Focus sessions ---------- */

export function addSession(minutes, deadlineId = null) {
	sessions.update((list) => [
		...list,
		{ id: uid(), at: Date.now(), minutes: Math.round(minutes * 10) / 10, deadlineId }
	]);
}

/* ---------- Categories ---------- */

export function addCategory(name, color) {
	const trimmed = name.trim();
	if (!trimmed) return 'Give the category a name.';
	const exists = Object.keys(get(categories)).some((c) => c.toLowerCase() === trimmed.toLowerCase());
	if (exists) return 'That category already exists.';
	categories.update((c) => ({ ...c, [trimmed]: color }));
	return null;
}

export function recolorCategory(name, color) {
	categories.update((c) => ({ ...c, [name]: color }));
}

export function renameCategory(oldName, newName) {
	const trimmed = newName.trim();
	if (!trimmed || trimmed === oldName) return null;
	const cats = get(categories);
	if (Object.keys(cats).some((c) => c !== oldName && c.toLowerCase() === trimmed.toLowerCase())) {
		return 'That name is taken.';
	}
	// Keep the original order.
	/** @type {Record<string, string>} */
	const next = {};
	for (const [k, v] of Object.entries(cats)) next[k === oldName ? trimmed : k] = v;
	categories.set(next);
	tasks.update((list) => list.map((t) => (t.category === oldName ? { ...t, category: trimmed } : t)));
	return null;
}

/** @param {string} name */
export function deleteCategory(name) {
	const prevCats = get(categories);
	const prevTasks = get(tasks);
	const count = prevTasks.filter((t) => t.category === name).length;
	tasks.set(prevTasks.filter((t) => t.category !== name));
	const { [name]: _, ...rest } = prevCats;
	categories.set(rest);
	toast(`Deleted “${name}”${count ? ` and ${count} task${count === 1 ? '' : 's'}` : ''}`, {
		action: {
			label: 'Undo',
			run: () => {
				categories.set(prevCats);
				tasks.set(prevTasks);
			}
		}
	});
}
