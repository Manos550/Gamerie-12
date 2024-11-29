import React from 'react';
import { TeamMembership } from '../../types';
import { Users, Trophy, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface TeamsListProps {
  teams: TeamMembership[];
}

export default function TeamsList({ teams }: TeamsListProps) {
  const { data: teamsData, isLoading, error } = useQuery({
    queryKey: ['teams', teams.map(t => t.teamId)],
    queryFn: async () => {
      const teamPromises = teams.map(async (team) => {
        const docRef = doc(db, 'teams', team.teamId);
        const docSnap = await getDoc(docRef);
        return { id: docSnap.id, ...docSnap.data() };
      });
      return Promise.all(teamPromises);
    },
    enabled: teams.length > 0
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Teams</h2>

        <div className="space-y-4">
          {teams.length === 0 ? (
            <p className="text-center py-4 text-gray-400">Not a member of any teams</p>
          ) : (
            teamsData?.map((team, index) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="block p-4 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-white truncate">
                        {team.name}
                      </h3>
                      <span className="text-sm text-gaming-neon">
                        {teams[index].role}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-400">
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
                        <span>Joined {formatDistanceToNow(teams[index].joinedAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}