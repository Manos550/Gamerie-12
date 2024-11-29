import React from 'react';
import { GameProfile } from '../../types';
import { Gamepad2, Trophy, Star } from 'lucide-react';

interface GamesGridProps {
  games: GameProfile[];
  type: 'esports' | 'casual';
  status?: 'active' | 'completed' | 'spectator';
}

export default function GamesGrid({ games, type, status }: GamesGridProps) {
  const filteredGames = games.filter(
    game => game.type === type && (!status || game.status === status)
  );

  if (filteredGames.length === 0) {
    return (
      <p className="text-center py-4 text-gray-400">
        No {type} games {status ? `(${status})` : ''} added yet
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredGames.map((game) => (
        <div
          key={game.gameId}
          className="bg-gaming-dark/50 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white">{game.name}</h3>
            <span className="text-gaming-neon text-sm">{game.title}</span>
          </div>

          <div className="space-y-2">
            {game.level && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Level</span>
                <span className="text-white">{game.level}</span>
              </div>
            )}
            {game.nickname && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Nickname</span>
                <span className="text-white">{game.nickname}</span>
              </div>
            )}
          </div>

          {game.achievements && game.achievements.length > 0 && (
            <div className="pt-2 border-t border-gaming-neon/20">
              <div className="flex items-center gap-1 text-sm text-gaming-neon mb-2">
                <Trophy className="w-4 h-4" />
                <span>Achievements</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {game.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full bg-gaming-neon/10 text-gaming-neon text-xs"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}