import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { Trophy, Users, Gamepad, ChevronRight } from 'lucide-react';

interface ProfilePreviewProps {
  user: User;
}

export default function ProfilePreview({ user }: ProfilePreviewProps) {
  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 relative">
        <img
          src={user.backgroundImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'}
          alt="Profile Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-card to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4">
        {/* Profile Image - Now positioned absolutely */}
        <div className="absolute -top-10 left-4">
          <img
            src={user.profileImage || 'https://via.placeholder.com/80'}
            alt={user.username}
            className="w-20 h-20 rounded-full border-4 border-gaming-card"
          />
        </div>

        {/* Content shifted down to accommodate the profile image */}
        <div className="pt-12">
          <Link to={`/profile/${user.id}`} className="block group">
            <h3 className="font-display font-bold text-lg text-white group-hover:text-gaming-neon">
              {user.username}
            </h3>
            <p className="text-sm text-gaming-neon mb-4">{user.role}</p>
          </Link>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 py-4 border-t border-gaming-neon/20">
            <div className="text-center">
              <div className="text-gaming-neon mb-1">
                <Trophy className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-bold text-white">{user.stats.tournamentWins}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </div>

            <div className="text-center">
              <div className="text-gaming-neon mb-1">
                <Users className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-bold text-white">{user.followers.length}</div>
              <div className="text-xs text-gray-400">Followers</div>
            </div>

            <div className="text-center">
              <div className="text-gaming-neon mb-1">
                <Gamepad className="w-5 h-5 mx-auto" />
              </div>
              <div className="font-bold text-white">{user.gamesPlayed.length}</div>
              <div className="text-xs text-gray-400">Games</div>
            </div>
          </div>

          {/* View Profile Link */}
          <Link
            to={`/profile/${user.id}`}
            className="flex items-center justify-between p-3 rounded-lg bg-gaming-dark/50 text-white hover:bg-gaming-dark group transition-colors"
          >
            <span>View Full Profile</span>
            <ChevronRight className="w-5 h-5 text-gaming-neon group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}