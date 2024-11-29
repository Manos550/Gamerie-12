import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Users, Trophy, Star, Clock } from 'lucide-react';
import { User, Team } from '../../types';
import { demoUsers } from '../../lib/demo-data';
import { getDemoTeams } from '../../lib/teams';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface SearchResults {
  players: User[];
  teams: Team[];
}

export default function GameSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const { data: results, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['game-search', searchTerm, selectedGame],
    queryFn: async () => {
      if (!searchTerm && !selectedGame) return { players: [], teams: [] };

      // In demo mode, search through demo data
      if (import.meta.env.MODE === 'development') {
        const searchTermLower = searchTerm.toLowerCase();
        const gameFilter = selectedGame?.toLowerCase();

        // Filter players
        const players = demoUsers.filter(user => {
          const matchesGame = !gameFilter || user.gamesPlayed.some(game => 
            game.name.toLowerCase() === gameFilter
          );

          const matchesSearch = !searchTerm || (
            user.username.toLowerCase().includes(searchTermLower) ||
            user.gamerTitle.toLowerCase().includes(searchTermLower) ||
            user.gamesPlayed.some(game => game.name.toLowerCase().includes(searchTermLower))
          );

          return matchesGame && matchesSearch;
        });

        // Filter teams
        const teams = getDemoTeams().filter(team => {
          const matchesGame = !gameFilter || team.games.some(game => 
            game.name.toLowerCase() === gameFilter
          );

          const matchesSearch = !searchTerm || (
            team.name.toLowerCase().includes(searchTermLower) ||
            team.description.toLowerCase().includes(searchTermLower) ||
            team.games.some(game => game.name.toLowerCase().includes(searchTermLower))
          );

          return matchesGame && matchesSearch;
        });

        return { players, teams };
      }

      return { players: [], teams: [] };
    },
    enabled: Boolean(searchTerm || selectedGame)
  });

  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-4">Game Search</h1>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search players or teams..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
            />
          </div>
          <select
            value={selectedGame || ''}
            onChange={(e) => setSelectedGame(e.target.value || null)}
            className="px-4 py-2 rounded-lg bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
          >
            <option value="">All Games</option>
            <option value="League of Legends">League of Legends</option>
            <option value="Valorant">Valorant</option>
            <option value="Dota 2">Dota 2</option>
            <option value="CS:GO">CS:GO</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Players Section */}
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gaming-neon" />
              Players
            </h2>
            <div className="space-y-4">
              {results?.players.map((player) => (
                <Link
                  key={player.id}
                  to={`/profile/${player.id}`}
                  className="block bg-gaming-card rounded-lg p-4 hover:border-gaming-neon border border-gaming-neon/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={player.profileImage}
                      alt={player.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{player.username}</h3>
                      <p className="text-gaming-neon text-sm">{player.gamerTitle}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{player.stats.tournamentWins} wins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{player.gameLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {results?.players.length === 0 && (
                <p className="text-center py-4 text-gray-400">No players found</p>
              )}
            </div>
          </div>

          {/* Teams Section */}
          <div>
            <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gaming-neon" />
              Teams
            </h2>
            <div className="space-y-4">
              {results?.teams.map((team) => (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="block bg-gaming-card rounded-lg p-4 hover:border-gaming-neon border border-gaming-neon/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{team.name}</h3>
                      <p className="text-gray-400 text-sm truncate">{team.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{team.members.length} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{team.stats.tournamentWins} wins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{team.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {results?.teams.length === 0 && (
                <p className="text-center py-4 text-gray-400">No teams found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}