import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { User } from '../types';
import { toast } from 'react-toastify';
import { useAuthStore } from './store';
import { updateDemoUser } from './demo-data';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

export const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    if (isDemoMode) {
      // Update demo user data
      updateDemoUser(userId, updates);
      
      // Update auth store
      const updatedUser = { ...useAuthStore.getState().user, ...updates, updatedAt: new Date() };
      useAuthStore.getState().setUser(updatedUser);
      
      toast.success('Profile updated successfully');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });

    toast.success('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
    throw error;
  }
};

export const uploadProfileImage = async (
  userId: string,
  file: File,
  type: 'profile' | 'background'
): Promise<string> => {
  try {
    if (isDemoMode) {
      const url = URL.createObjectURL(file);
      
      // Update demo user data
      updateDemoUser(userId, {
        [type === 'profile' ? 'profileImage' : 'backgroundImage']: url
      });
      
      // Update auth store
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          [type === 'profile' ? 'profileImage' : 'backgroundImage']: url,
          updatedAt: new Date()
        });
      }
      
      return url;
    }

    const fileRef = ref(storage, `users/${userId}/${type}-${Date.now()}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    
    // Update user profile with new image URL
    await updateProfile(userId, {
      [type === 'profile' ? 'profileImage' : 'backgroundImage']: url
    });
    
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
    throw error;
  }
};

export const deleteProfileImage = async (
  userId: string,
  imageUrl: string,
  type: 'profile' | 'background'
): Promise<void> => {
  try {
    if (isDemoMode) {
      // Update demo user data
      updateDemoUser(userId, {
        [type === 'profile' ? 'profileImage' : 'backgroundImage']: null
      });
      
      // Update auth store
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({
          ...currentUser,
          [type === 'profile' ? 'profileImage' : 'backgroundImage']: null,
          updatedAt: new Date()
        });
      }
      
      toast.success('Image deleted successfully');
      return;
    }

    // Delete from storage
    const fileRef = ref(storage, imageUrl);
    await deleteObject(fileRef);
    
    // Update profile to remove image URL
    await updateProfile(userId, {
      [type === 'profile' ? 'profileImage' : 'backgroundImage']: null
    });
    
    toast.success('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    toast.error('Failed to delete image');
    throw error;
  }
};