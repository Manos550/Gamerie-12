import React from 'react';
import { User } from '../../types';
import { Info } from 'lucide-react';

interface GamerInfoProps {
  user: User;
}

export default function GamerInfo({ user }: GamerInfoProps) {
  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-gaming-neon" />
        <h2 className="font-display text-lg font-bold text-white">
          Personal Information
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {user.personalInfo && (
          <>
            {user.personalInfo.fullName && (
              <>
                <span className="text-gray-400">Name</span>
                <span className="text-white text-right">{user.personalInfo.fullName}</span>
              </>
            )}
            {user.personalInfo.age && (
              <>
                <span className="text-gray-400">Age</span>
                <span className="text-white text-right">{user.personalInfo.age}</span>
              </>
            )}
            {user.personalInfo.gender && (
              <>
                <span className="text-gray-400">Gender</span>
                <span className="text-white text-right">{user.personalInfo.gender}</span>
              </>
            )}
            {user.personalInfo.location && (
              <>
                <span className="text-gray-400">Location</span>
                <span className="text-white text-right">{user.personalInfo.location}</span>
              </>
            )}
            {user.personalInfo.profession && (
              <>
                <span className="text-gray-400">Profession</span>
                <span className="text-white text-right">{user.personalInfo.profession}</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}