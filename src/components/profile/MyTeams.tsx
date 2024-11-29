import React from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../../types';
import { Users, Trophy, Calendar, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDemoTeams } from '../../lib/teams';
import { formatDistanceToNow } from 'date-fns';

interface MyTeamsProps {
  userId: string;
}

export default function MyTeams({ userId }: MyTeamsProps) {
  // Fetch teams where user is a member
  const { data: teams, isLoading } = useQuery({
    queryKey: ['user-teams', userId],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        const allTeams = getDemoTeams();
        return allTeams.filter(team => 
          team.members.some(member => member.userId === userId)
        );
      }
      return [];
    }
  });

  if (isLoading) {
    return (
      <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gaming-dark/50 rounded w-1/4"></div>
          <div className="h-32 bg-gaming-dark/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">My Teams</h2>
        </div>

        {teams?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">You're not a member of any teams yet</p>
            <Link
              to="/teams"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors"
            >
              <Users className="w-4 h-4" />
              Browse Teams
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {teams?.map((team) => {
              const userMembership = team.members.find(member => member.userId === userId);
              
              return (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="block p-4 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display font-bold text-white group-hover:text-gaming-neon transition-colors truncate">
                          {team.name}
                        </h3>
                        <span className="text-sm text-gaming-neon">
                          {userMembership?.role}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{team.members.length} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{team.stats.tournamentWins} tournament wins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Joined {formatDistanceToNow(userMembership?.joinedAt || new Date(), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Team Games */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {team.games.map((game) => (
                          <span
                            key={game.id}
                            className="px-2 py-1 rounded-full bg-gaming-neon/10 text-gaming-neon text-xs"
                          >
                            {game.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}