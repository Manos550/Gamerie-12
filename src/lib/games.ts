import { doc, updateDoc, arrayUnion, arrayRemove, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { useAuthStore } from './store';
import { toast } from 'react-toastify';
import { GamePage } from '../types';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

export const createGame = async (data: Partial<GamePage> & { wallPhoto?: File }): Promise<void> => {
  try {
    let wallPhotoUrl = '';

    if (isDemoMode) {
      if (data.wallPhoto) {
        wallPhotoUrl = URL.createObjectURL(data.wallPhoto);
      }
      toast.success('Game created successfully');
      return;
    }

    if (data.wallPhoto) {
      const fileRef = ref(storage, `games/${data.id}/wall-photo`);
      await uploadBytes(fileRef, data.wallPhoto);
      wallPhotoUrl = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, 'games'), {
      ...data,
      wallPhoto: wallPhotoUrl,
      followers: [],
      teams: [],
      followers_stats: {
        total: 0,
        active_gamers: 0,
        streamers: 0,
        spectators: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    toast.success('Game created successfully');
  } catch (error) {
    console.error('Error creating game:', error);
    toast.error('Failed to create game');
    throw error;
  }
};

export const updateGame = async (gameId: string, updates: Partial<GamePage> & { wallPhoto?: File }): Promise<void> => {
  try {
    let wallPhotoUrl = '';

    if (isDemoMode) {
      if (updates.wallPhoto) {
        wallPhotoUrl = URL.createObjectURL(updates.wallPhoto);
      }
      toast.success('Game updated successfully');
      return;
    }

    if (updates.wallPhoto) {
      const fileRef = ref(storage, `games/${gameId}/wall-photo`);
      await uploadBytes(fileRef, updates.wallPhoto);
      wallPhotoUrl = await getDownloadURL(fileRef);
    }

    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...updates,
      ...(wallPhotoUrl && { wallPhoto: wallPhotoUrl }),
      updatedAt: new Date()
    });

    toast.success('Game updated successfully');
  } catch (error) {
    console.error('Error updating game:', error);
    toast.error('Failed to update game');
    throw error;
  }
};

export const deleteGame = async (gameId: string): Promise<void> => {
  try {
    if (isDemoMode) {
      toast.success('Game deleted successfully');
      return;
    }

    await deleteDoc(doc(db, 'games', gameId));
    toast.success('Game deleted successfully');
  } catch (error) {
    console.error('Error deleting game:', error);
    toast.error('Failed to delete game');
    throw error;
  }
};

export const followGame = async (gameId: string): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Must be logged in to follow games');

  try {
    if (isDemoMode) {
      toast.success('Successfully followed game');
      return;
    }

    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      followers: arrayUnion(user.id)
    });

    toast.success('Successfully followed game');
  } catch (error) {
    toast.error('Failed to follow game');
    throw error;
  }
};

export const unfollowGame = async (gameId: string): Promise<void> => {
  const user = useAuthStore.getState().user;
  if (!user) throw new Error('Must be logged in to unfollow games');

  try {
    if (isDemoMode) {
      toast.success('Successfully unfollowed game');
      return;
    }

    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      followers: arrayRemove(user.id)
    });

    toast.success('Successfully unfollowed game');
  } catch (error) {
    toast.error('Failed to unfollow game');
    throw error;
  }
};