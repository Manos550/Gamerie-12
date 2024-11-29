import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { useAuthStore } from '../../lib/store';
import { getDemoUser } from '../../lib/demo-data';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const isDemoMode = import.meta.env.MODE === 'development';
  
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (isDemoMode) {
        const demoUser = userId ? getDemoUser(userId) : currentUser;
        if (!demoUser) throw new Error('User not found');
        return demoUser;
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Profile not found');
      }
      
      return docSnap.data() as User;
    },
    enabled: Boolean(userId) || (isDemoMode && currentUser)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!profile) return null;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProfileHeader 
        profile={profile} 
        isOwnProfile={isOwnProfile} 
      />
      
      <div className="mt-6">
        <ProfileTabs 
          profile={profile}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
}