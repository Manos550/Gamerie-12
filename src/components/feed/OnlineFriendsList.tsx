import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { Circle } from 'lucide-react';

interface OnlineFriendsListProps {
  users: User[];
}

export default function OnlineFriendsList({ users }: OnlineFriendsListProps) {
  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
      <h2 className="font-display text-xl font-bold text-white mb-4">Online Friends</h2>

      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-center text-gray-400">No friends online</p>
        ) : (
          users.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors group"
            >
              <div className="relative">
                <img
                  src={user.profileImage || 'https://via.placeholder.com/32'}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <Circle className="absolute -bottom-1 -right-1 w-3 h-3 text-green-500 fill-current" />
              </div>
              <div>
                <div className="text-white group-hover:text-gaming-neon transition-colors">
                  {user.username}
                </div>
                <div className="text-xs text-gray-400">
                  {user.gamerTitle}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}