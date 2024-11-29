import { useAuthStore } from './store';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

// In-memory presence store for demo mode
const demoPresence = new Map<string, boolean>();

export const initializePresence = (userId: string) => {
  if (isDemoMode) {
    demoPresence.set(userId, true);
    return;
  }

  const userRef = doc(db, 'users', userId);
  
  // Set user as online
  updateDoc(userRef, {
    isOnline: true,
    lastSeen: new Date()
  });

  // Set up disconnect hook
  window.addEventListener('beforeunload', () => {
    updateDoc(userRef, {
      isOnline: false,
      lastSeen: new Date()
    });
  });
};

export const listenToPresence = (userId: string, callback: (isOnline: boolean) => void) => {
  if (isDemoMode) {
    // For demo, randomly change online status every 30 seconds
    const interval = setInterval(() => {
      const isOnline = Math.random() > 0.3;
      demoPresence.set(userId, isOnline);
      callback(isOnline);
    }, 30000);

    callback(demoPresence.get(userId) || false);
    return () => clearInterval(interval);
  }

  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    const data = doc.data();
    callback(data?.isOnline || false);
  });
};

export const updatePresence = async (userId: string, isOnline: boolean) => {
  if (isDemoMode) {
    demoPresence.set(userId, isOnline);
    return;
  }

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    isOnline,
    lastSeen: new Date()
  });
};