import { useState, useEffect } from 'react';
import { listenToPresence } from '../lib/presence';

export function usePresence(userId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToPresence(userId, (status) => {
      setIsOnline(status);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [userId]);

  return isOnline;
}