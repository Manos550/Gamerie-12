import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types';
import { Users, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface RecommendedTeamsProps {
  userId: string;
}

export default function RecommendedTeams({ userId }: RecommendedTeamsProps) {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['recommended-teams', userId],
    queryFn: async () => {
      // In a real app, you'd have more sophisticated recommendation logic
      const q = query(
        collection(db, 'teams'),
        where('members', 'array-contains', userId),
        limit(3)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Recommended Teams</h2>
        
        <div className="space-y-4">
          {teams?.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No recommendations available</p>
          ) : (
            teams?.map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="block p-4 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-white truncate">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{team.members.length} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{team.stats.tournamentWins} wins</span>
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