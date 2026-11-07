import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
	initializeFirestore,
	getFirestore,
	persistentLocalCache,
	persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyCLHSh1BXfg1zFOn3Wk-yQE6jRW_WD4scI',
	authDomain: 'student-ly.firebaseapp.com',
	projectId: 'student-ly',
	storageBucket: 'student-ly.firebasestorage.app',
	messagingSenderId: '880494619208',
	appId: '1:880494619208:web:f7b8fde4bec5d11275467d'
};

// Reuse the app during hot reloads instead of initializing twice.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

function createDb() {
	try {
		// Offline cache: instant loads and edits that sync when back online.
		return initializeFirestore(app, {
			ignoreUndefinedProperties: true,
			localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
		});
	} catch {
		return getFirestore(app);
	}
}

export const db = createDb();
