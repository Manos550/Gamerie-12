import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import FollowButton from './FollowButton';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { getDemoUser } from '../../lib/demo-data';

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
  userIds: string[];
}

export default function FollowersList({ userId, type, userIds }: FollowersListProps) {
  const isDemoMode = import.meta.env.MODE === 'development';

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', type, userIds],
    queryFn: async () => {
      if (isDemoMode) {
        return userIds.map(id => getDemoUser(id)).filter(Boolean) as User[];
      }

      const userPromises = userIds.map(async (id) => {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        return { id: docSnap.id, ...docSnap.data() } as User;
      });
      return Promise.all(userPromises);
    },
    enabled: userIds.length > 0
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
        </div>

        <div className="space-y-4">
          {users?.length === 0 ? (
            <p className="text-center py-4 text-gray-400">
              {type === 'followers' ? 'No followers yet' : 'Not following anyone'}
            </p>
          ) : (
            users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50"
              >
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                >
                  <img
                    src={user.profileImage || 'https://via.placeholder.com/40'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-400 truncate">
                      {user.gamerTitle} • {user.gameLevel}
                    </p>
                  </div>
                </Link>

                <FollowButton
                  targetUserId={user.id}
                  isFollowing={user.followers.includes(userId)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}