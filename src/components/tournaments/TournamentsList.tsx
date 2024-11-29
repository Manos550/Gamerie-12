import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecommendedTournaments } from '../../lib/tournaments';
import { useAuthStore } from '../../lib/store';
import TournamentCard from './TournamentCard';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

export default function TournamentsList() {
  const { user } = useAuthStore();

  const { data: tournaments, isLoading, error } = useQuery({
    queryKey: ['tournaments', user?.id],
    queryFn: () => getRecommendedTournaments(user?.id || ''),
    enabled: !!user
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold text-white mb-8">
        Recommended Tournaments
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments?.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  );
}