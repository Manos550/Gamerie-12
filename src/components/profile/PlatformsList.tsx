import React from 'react';
import { Platform } from '../../types';
import { Monitor, Gamepad } from 'lucide-react';

interface PlatformsListProps {
  platforms: Platform[];
}

export default function PlatformsList({ platforms }: PlatformsListProps) {
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'PC':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Gamepad className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
      <h2 className="font-display text-xl font-bold text-white mb-4">
        Gaming Platforms
      </h2>

      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => (
          <div
            key={platform}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gaming-dark/50 text-gaming-neon"
          >
            {getPlatformIcon(platform)}
            <span>{platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
}