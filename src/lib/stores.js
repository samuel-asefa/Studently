import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const user = writable(null);

if (browser) {
	onAuthStateChanged(auth, (firebaseUser) => {
		user.set(firebaseUser);
		if (firebaseUser) {
			loadUserData(firebaseUser.uid);
		} else {
			categories.set({
				'Work': '#3b82f6',
				'Study': '#10b981',
				'Personal': '#ef4444'
			});
			tasks.set([]);
			deadlines.set([]);
		}
	});
}

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

export const categories = writable({
	'Work': '#3b82f6',
	'Study': '#10b981',
	'Personal': '#ef4444'
});

export const tasks = writable([]);

export const deadlines = writable([]);

export const theme = createLocalStore('theme', 'light');
export const font = createLocalStore('font', 'Inter');

async function saveUserData(userId, data) {
	if (!userId) return;
	try {
		await setDoc(doc(db, 'users', userId), data, { merge: true });
	} catch (error) {
		console.error('Error saving data:', error);
	}
}

async function loadUserData(userId) {
	if (!userId) return;
	try {
		const docRef = doc(db, 'users', userId);
		const docSnap = await getDoc(docRef);
		
		if (docSnap.exists()) {
			const data = docSnap.data();
			if (data.categories) categories.set(data.categories);
			if (data.tasks) tasks.set(data.tasks);
			if (data.deadlines) deadlines.set(data.deadlines);
		}

		onSnapshot(docRef, (doc) => {
			if (doc.exists()) {
				const data = doc.data();
				if (data.categories) categories.set(data.categories);
				if (data.tasks) tasks.set(data.tasks);
				if (data.deadlines) deadlines.set(data.deadlines);
			}
		});
	} catch (error) {
		console.error('Error loading data:', error);
	}
}

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

	deadlines.subscribe((value) => {
		const currentUser = auth.currentUser;
		if (currentUser) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				saveUserData(currentUser.uid, { deadlines: value });
			}, 500);
		}
	});
}