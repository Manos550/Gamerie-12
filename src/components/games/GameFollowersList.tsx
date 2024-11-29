import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GameFollower } from '../../types';
import { Users, Radio, Eye } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface GameFollowersListProps {
  gameId: string;
}

export default function GameFollowersList({ gameId }: GameFollowersListProps) {
  const [filter, setFilter] = useState<'all' | 'gamer' | 'streamer' | 'spectator'>('all');

  const { data: followers, isLoading, error } = useQuery({
    queryKey: ['game-followers', gameId, filter],
    queryFn: async () => {
      // In demo mode, return mock data
      if (import.meta.env.MODE === 'development') {
        return Array(10).fill(null).map((_, i) => ({
          userId: `user-${i}`,
          username: `User ${i}`,
          profileImage: 'https://via.placeholder.com/40',
          type: ['gamer', 'streamer', 'spectator'][Math.floor(Math.random() * 3)],
          followedAt: new Date()
        }));
      }

      const q = query(
        collection(db, 'game_followers'),
        where('gameId', '==', gameId),
        filter !== 'all' ? where('type', '==', filter) : undefined
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'streamer':
        return <Radio className="w-4 h-4 text-gaming-neon" />;
      case 'spectator':
        return <Eye className="w-4 h-4 text-gaming-neon" />;
      default:
        return <Users className="w-4 h-4 text-gaming-neon" />;
    }
  };

  return (
    <div className="bg-gaming-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold text-white">Followers</h2>
        
        <div className="flex gap-2">
          {(['all', 'gamer', 'streamer', 'spectator'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === type
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark/50 text-white hover:bg-gaming-dark'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {followers?.map((follower: any) => (
          <div
            key={follower.userId}
            className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50"
          >
            <div className="flex items-center gap-4">
              <img
                src={follower.profileImage}
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="text-white">{follower.username}</div>
                <div className="flex items-center gap-1 text-sm text-gaming-neon">
                  {getTypeIcon(follower.type)}
                  <span className="capitalize">{follower.type}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Followed {new Date(follower.followedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}