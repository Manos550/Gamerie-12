import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import { useAuthStore } from './store';
import { toast } from 'react-toastify';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

export const followUser = async (targetUserId: string): Promise<void> => {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) throw new Error('Must be logged in to follow users');

  try {
    if (isDemoMode) {
      // Update local state for demo mode
      const store = useAuthStore.getState();
      store.setUser({
        ...currentUser,
        following: [...currentUser.following, targetUserId]
      });
      return;
    }

    // Update current user's following list
    const currentUserRef = doc(db, 'users', currentUser.id);
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });

    // Update target user's followers list
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUser.id)
    });

    toast.success('Successfully followed user');
  } catch (error) {
    toast.error('Failed to follow user');
    throw error;
  }
};

export const unfollowUser = async (targetUserId: string): Promise<void> => {
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) throw new Error('Must be logged in to unfollow users');

  try {
    if (isDemoMode) {
      // Update local state for demo mode
      const store = useAuthStore.getState();
      store.setUser({
        ...currentUser,
        following: currentUser.following.filter(id => id !== targetUserId)
      });
      return;
    }

    // Update current user's following list
    const currentUserRef = doc(db, 'users', currentUser.id);
    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId)
    });

    // Update target user's followers list
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUser.id)
    });

    toast.success('Successfully unfollowed user');
  } catch (error) {
    toast.error('Failed to unfollow user');
    throw error;
  }
};