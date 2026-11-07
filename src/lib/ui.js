import { writable } from 'svelte/store';
import { NAV } from './constants.js';

const VIEWS = NAV.map((n) => n.id);

function initialView() {
	if (typeof location === 'undefined') return 'today';
	const v = location.hash.replace(/^#\/?/, '');
	return VIEWS.includes(v) ? v : 'today';
}

export const view = writable(initialView());

export function go(id) {
	if (!VIEWS.includes(id)) return;
	view.set(id);
	if (typeof history !== 'undefined' && location.hash !== `#/${id}`) {
		history.pushState(null, '', `#/${id}`);
	}
	if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
}

export function syncViewFromHash() {
	view.set(initialView());
}

export const paletteOpen = writable(false);
export const paletteSeed = writable('');
export const settingsOpen = writable(false);

export function openPalette(seed = '') {
	paletteSeed.set(seed);
	paletteOpen.set(true);
}

/** Deadline the focus timer should preselect when the Focus view opens. */
export const focusTarget = writable(null);

/* ---------- Toasts ---------- */

export const toasts = writable([]);
let toastId = 0;

/**
 * toast('Saved') or toast('Task deleted', { tone: 'danger', action: { label: 'Undo', run } })
 */
export function toast(message, { tone = 'default', icon = null, action = null, duration = action ? 7000 : 4200 } = {}) {
	const id = ++toastId;
	toasts.update((list) => [...list.slice(-3), { id, message, tone, icon, action }]);
	if (duration) setTimeout(() => dismissToast(id), duration);
	return id;
}

export function dismissToast(id) {
	toasts.update((list) => list.filter((t) => t.id !== id));
}

/* ---------- Confirm dialog ---------- */

export const confirmState = writable(null);

/** Promise-based replacement for window.confirm(). */
export function confirm({ title, message = '', confirmLabel = 'Confirm', danger = false }) {
	return new Promise((resolve) => {
		confirmState.set({ title, message, confirmLabel, danger, resolve });
	});
}
