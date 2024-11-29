import React from 'react';
import { Link } from 'react-router-dom';
import { GamePage } from '../../types';
import { Users, Trophy, Gamepad } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { getDemoGame } from '../../lib/search';

export default function GamesList() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      // In demo mode, return demo games
      if (import.meta.env.MODE === 'development') {
        const gameIds = ['cs2', 'lol', 'dota2', 'valorant', 'fifa', 'cod', 'wow'];
        const games = await Promise.all(
          gameIds.map(id => getDemoGame(id))
        );
        return games.filter(Boolean) as GamePage[];
      }
      return [];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">All Games</h1>

      <div className="space-y-8">
        {games?.map((game) => (
          <Link
            key={game.id}
            to={`/games/${game.id}`}
            className="block bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden hover:border-gaming-neon transition-colors"
          >
            {/* Banner Image */}
            <div className="h-64 relative">
              <img
                src={game.wallPhoto}
                alt={game.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gaming-card to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white group-hover:text-gaming-neon transition-colors">
                      {game.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gaming-neon">{game.company}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{game.gameType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="p-6">
              <p className="text-gray-400 mb-6 line-clamp-2">{game.description}</p>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-gaming-neon mb-1">
                    <Gamepad className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {game.followers_stats.active_gamers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Active Players</div>
                </div>

                <div className="text-center">
                  <div className="text-gaming-neon mb-1">
                    <Trophy className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {game.followers_stats.streamers.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Streamers</div>
                </div>

                <div className="text-center">
                  <div className="text-gaming-neon mb-1">
                    <Users className="w-4 h-4 mx-auto" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {game.followers_stats.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Total Players</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {game.gameModes.slice(0, 3).map((mode, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-gaming-dark/50 text-gaming-neon text-sm"
                  >
                    {mode}
                  </span>
                ))}
                {game.gameModes.length > 3 && (
                  <span className="px-3 py-1 rounded-full bg-gaming-dark/50 text-gaming-neon text-sm">
                    +{game.gameModes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {games?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No games found</p>
          </div>
        )}
      </div>
    </div>
  );
}