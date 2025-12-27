import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// A custom store that syncs with localStorage
const createPersistentStore = (key, startValue) => {
	let initialValue = startValue;
	
	// Only access localStorage in the browser
	if (browser) {
		try {
			const storedValue = window.localStorage.getItem(key);
			if (storedValue !== null) {
				initialValue = JSON.parse(storedValue);
			}
		} catch (error) {
			// If parsing fails, try to use the raw value (for backward compatibility)
			const rawValue = window.localStorage.getItem(key);
			if (rawValue !== null) {
				initialValue = rawValue;
				// Re-save it in the correct format
				window.localStorage.setItem(key, JSON.stringify(rawValue));
			}
		}
	}

	const store = writable(initialValue);

	// Only subscribe to changes in the browser
	if (browser) {
		store.subscribe((value) => {
			window.localStorage.setItem(key, JSON.stringify(value));
		});
	}

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