import React from 'react';
import { Link } from 'react-router-dom';
import { User, Team, GamePage } from '../../types';
import { Users, Gamepad2, Trophy } from 'lucide-react';

interface SearchResultsProps {
  users: User[];
  teams: Team[];
  games: GamePage[];
  isLoading: boolean;
}

export default function SearchResults({ users, teams, games, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-gaming-card rounded-lg shadow-xl border border-gaming-neon/20 p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gaming-dark/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0 && teams.length === 0 && games.length === 0) {
    return null;
  }

  return (
    <div className="bg-gaming-card rounded-lg shadow-xl border border-gaming-neon/20 divide-y divide-gaming-neon/20">
      {games.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Games</h3>
          <div className="space-y-2">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors"
              >
                <Gamepad2 className="w-5 h-5 text-gaming-neon" />
                <div>
                  <div className="text-white">{game.name}</div>
                  <div className="text-sm text-gray-400">
                    {game.followers_stats.total.toLocaleString()} followers
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {teams.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Teams</h3>
          <div className="space-y-2">
            {teams.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors"
              >
                <Trophy className="w-5 h-5 text-gaming-neon" />
                <div>
                  <div className="text-white">{team.name}</div>
                  <div className="text-sm text-gray-400">
                    {team.members.length} members
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Users</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gaming-dark/50 transition-colors"
              >
                <Users className="w-5 h-5 text-gaming-neon" />
                <div>
                  <div className="text-white">{user.username}</div>
                  <div className="text-sm text-gray-400">{user.gamerTitle}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}