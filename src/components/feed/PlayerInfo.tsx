import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { Trophy, Gamepad, Users } from 'lucide-react';
import OnlineStatus from '../shared/OnlineStatus';

interface PlayerInfoProps {
  user: User;
}

export default function PlayerInfo({ user }: PlayerInfoProps) {
  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
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
          <div className="flex items-center gap-2 mt-1">
            <OnlineStatus userId={user.id} showText />
          </div>
          <p className="text-gaming-neon mt-1">{user.gamerTitle}</p>
          <p className="text-sm text-gray-300 mt-1">
            Gamer Level: <span className="text-blue-500">{user.gameLevel}</span>
          </p>
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
      </div>
    </div>
  );
}