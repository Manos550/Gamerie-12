import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Demo mode configuration for development
const isDemoMode = import.meta.env.MODE === 'development';

const firebaseConfig = {
  apiKey: isDemoMode ? 'demo-key' : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isDemoMode ? 'demo.firebaseapp.com' : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: isDemoMode ? 'demo-project' : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: isDemoMode ? 'demo.appspot.com' : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: isDemoMode ? '123456789' : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: isDemoMode ? '1:123456789:web:abc123' : import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  if (!isDemoMode) {
    throw new Error('Failed to initialize Firebase. Please check your configuration.');
  }
}

export { auth, db, storage };
export const isFirebaseInitialized = true;