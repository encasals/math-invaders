import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyB0DF2nZXF67-KrCV6tSu9Pg8RyE_nWqYA",
  authDomain: "math-invaders.firebaseapp.com",
  projectId: "math-invaders",
  storageBucket: "math-invaders.firebasestorage.app",
  messagingSenderId: "451463643076",
  appId: "1:451463643076:web:45877bb7a851fe2e55ae91",
  measurementId: "G-8VTT8HEJQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;