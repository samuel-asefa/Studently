import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: "AIzaSyCLHSh1BXfg1zFOn3Wk-yQE6jRW_WD4scI",
	authDomain: "student-ly.firebaseapp.com",
	projectId: "student-ly",
	storageBucket: "student-ly.firebasestorage.app",
	messagingSenderId: "880494619208",
	appId: "1:880494619208:web:f7b8fde4bec5d11275467d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);