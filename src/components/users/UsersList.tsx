import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { Trophy, Gamepad, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { demoUsers } from '../../lib/demo-data';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import FollowButton from '../profile/FollowButton';

export default function UsersList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // In demo mode, return demo users
      if (import.meta.env.MODE === 'development') {
        return demoUsers;
      }

      // In real app, fetch from Firebase
      return [];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-display font-bold text-white mb-8">Gamers</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user: User) => (
          <div
            key={user.id}
            className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden"
          >
            <div className="h-32 relative">
              <img
                src={user.backgroundImage || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80'}
                alt="Profile Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gaming-card to-transparent" />
            </div>

            <div className="p-6 -mt-12 relative">
              <Link to={`/profile/${user.id}`} className="block">
                <img
                  src={user.profileImage || 'https://via.placeholder.com/100'}
                  alt={user.username}
                  className="w-20 h-20 rounded-full border-4 border-gaming-card mb-4"
                />
                <h2 className="text-xl font-display font-bold text-white hover:text-gaming-neon transition-colors">
                  {user.username}
                </h2>
                <p className="text-gaming-neon">{user.gamerTitle}</p>
              </Link>

              <div className="mt-4 grid grid-cols-3 gap-2 py-4 border-t border-gaming-neon/20">
                <div className="text-center">
                  <div className="text-gaming-neon mb-1">
                    <Trophy className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-sm font-bold text-white">{user.stats.tournamentWins}</div>
                  <div className="text-xs text-gray-400">Wins</div>
                </div>

                <div className="text-center">
                  <div className="text-gaming-neon mb-1">
                    <Gamepad className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-sm font-bold text-white">{user.gamesPlayed.length}</div>
                  <div className="text-xs text-gray-400">Games</div>
                </div>

                <div className="text-center">
                  <div className="text-gaming-neon mb-1">
                    <Users className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-sm font-bold text-white">{user.followers.length}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
              </div>

              <div className="mt-4">
                <FollowButton
                  targetUserId={user.id}
                  isFollowing={false}
                  onFollowChange={() => {}}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}