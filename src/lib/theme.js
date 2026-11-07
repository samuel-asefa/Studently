import { get } from 'svelte/store';
import { settings } from './stores.js';

export function resolvedTheme(pref) {
	if (pref === 'light' || pref === 'dark') return pref;
	return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
}

/**
 * Change theme with a circular reveal from the click point (View Transitions),
 * falling back to an instant switch.
 */
export function setTheme(pref, event) {
	const root = document.documentElement;
	const apply = () => {
		root.dataset.theme = resolvedTheme(pref);
		settings.update((s) => ({ ...s, theme: pref }));
	};

	const reduced =
		matchMedia('(prefers-reduced-motion: reduce)').matches || get(settings).reduceMotion;
	if (!document.startViewTransition || reduced || resolvedTheme(pref) === root.dataset.theme) {
		apply();
		return;
	}

	const x = event?.clientX ?? window.innerWidth - 40;
	const y = event?.clientY ?? 40;
	const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
	root.style.setProperty('--vt-x', `${x}px`);
	root.style.setProperty('--vt-y', `${y}px`);
	root.style.setProperty('--vt-r', `${r}px`);
	document.startViewTransition(apply);
}

export function toggleTheme(event) {
	const current = document.documentElement.dataset.theme;
	setTheme(current === 'dark' ? 'light' : 'dark', event);
}
