import React from 'react';
import { Circle } from 'lucide-react';
import { usePresence } from '../../hooks/usePresence';

interface OnlineStatusProps {
  userId: string;
  showText?: boolean;
  className?: string;
}

export default function OnlineStatus({ userId, showText = false, className = '' }: OnlineStatusProps) {
  const isOnline = usePresence(userId);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative w-3 h-3 ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
        <Circle className="w-full h-full fill-current" />
      </div>
      {showText && (
        <span className="text-sm text-gray-300">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  );
}