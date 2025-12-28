import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// User store
export const user = writable(null);

// Initialize auth state listener
if (browser) {
	onAuthStateChanged(auth, (firebaseUser) => {
		user.set(firebaseUser);
		if (firebaseUser) {
			// Load user data from Firestore when logged in
			loadUserData(firebaseUser.uid);
		} else {
			// Reset to defaults when logged out
			categories.set({
				'Work': '#3b82f6',
				'Study': '#10b981',
				'Personal': '#ef4444'
			});
			tasks.set([]);
		}
	});
}

// Theme and font still use localStorage
const createLocalStore = (key, startValue) => {
	let initialValue = startValue;
	
	if (browser) {
		try {
			const storedValue = window.localStorage.getItem(key);
			if (storedValue !== null) {
				initialValue = JSON.parse(storedValue);
			}
		} catch (error) {
			const rawValue = window.localStorage.getItem(key);
			if (rawValue !== null) {
				initialValue = rawValue;
				window.localStorage.setItem(key, JSON.stringify(rawValue));
			}
		}
	}

	const store = writable(initialValue);

	if (browser) {
		store.subscribe((value) => {
			window.localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
};

// Categories and tasks will sync with Firestore
export const categories = writable({
	'Work': '#3b82f6',
	'Study': '#10b981',
	'Personal': '#ef4444'
});

export const tasks = writable([]);

export const theme = createLocalStore('theme', 'light');
export const font = createLocalStore('font', 'Inter');

// Save data to Firestore
async function saveUserData(userId, data) {
	if (!userId) return;
	try {
		await setDoc(doc(db, 'users', userId), data, { merge: true });
	} catch (error) {
		console.error('Error saving data:', error);
	}
}

// Load data from Firestore
async function loadUserData(userId) {
	if (!userId) return;
	try {
		const docRef = doc(db, 'users', userId);
		const docSnap = await getDoc(docRef);
		
		if (docSnap.exists()) {
			const data = docSnap.data();
			if (data.categories) categories.set(data.categories);
			if (data.tasks) tasks.set(data.tasks);
		}

		// Set up real-time listener
		onSnapshot(docRef, (doc) => {
			if (doc.exists()) {
				const data = doc.data();
				if (data.categories) categories.set(data.categories);
				if (data.tasks) tasks.set(data.tasks);
			}
		});
	} catch (error) {
		console.error('Error loading data:', error);
	}
}

// Subscribe to changes and save to Firestore
if (browser) {
	let saveTimeout;
	categories.subscribe((value) => {
		const currentUser = auth.currentUser;
		if (currentUser) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				saveUserData(currentUser.uid, { categories: value });
			}, 500);
		}
	});

	tasks.subscribe((value) => {
		const currentUser = auth.currentUser;
		if (currentUser) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				saveUserData(currentUser.uid, { tasks: value });
			}, 500);
		}
	});
}