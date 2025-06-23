import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// A custom store that syncs with localStorage
const createPersistentStore = (key, startValue) => {
	const initialValue = browser ? window.localStorage.getItem(key) : null;
	const store = writable(initialValue ? JSON.parse(initialValue) : startValue);

	store.subscribe((value) => {
		if (browser) {
			window.localStorage.setItem(key, JSON.stringify(value));
		}
	});
	return store;
};

// Create stores for all our application data
export const categories = createPersistentStore('categories', {
	'Work': '#3b82f6',
	'Study': '#10b981',
	'Personal': '#ef4444'
});

export const tasks = createPersistentStore('tasks', []);
export const theme = createPersistentStore('theme', 'light');
export const font = createPersistentStore('font', 'Inter');