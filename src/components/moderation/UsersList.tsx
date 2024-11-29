import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '../../types';
import { demoUsers } from '../../lib/demo-data';
import { getDemoTeams } from '../../lib/teams';
import { Search, Shield, Ban, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function UsersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        return demoUsers;
      }
      return [];
    }
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'banned' && user.isBanned) ||
                         (filter === 'active' && !user.isBanned);
    return matchesSearch && matchesFilter;
  });

  const handleBanUser = async (userId: string) => {
    // Implement ban user functionality
    console.log('Ban user:', userId);
  };

  const handleUnbanUser = async (userId: string) => {
    // Implement unban user functionality
    console.log('Unban user:', userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">Users</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md ${
                filter === 'all'
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-md ${
                filter === 'active'
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('banned')}
              className={`px-3 py-1 rounded-md ${
                filter === 'banned'
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              Banned
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers?.map((user) => (
          <div
            key={user.id}
            className="bg-gaming-dark/50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-bold text-white">{user.username}</h3>
                <div className="text-sm text-gray-400">
                  Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {user.role}
              </div>
              {user.isBanned ? (
                <button
                  onClick={() => handleUnbanUser(user.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20"
                >
                  <UserCheck className="w-4 h-4" />
                  Unban
                </button>
              ) : (
                <button
                  onClick={() => handleBanUser(user.id)}
                  className="flex items-center gap-2 px-3 py-1 bg-gaming-accent/10 text-gaming-accent rounded-md hover:bg-gaming-accent/20"
                >
                  <Ban className="w-4 h-4" />
                  Ban
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}