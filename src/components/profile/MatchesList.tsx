import React from 'react';
import { Challenge } from '../../types';
import MatchBanner from '../challenges/MatchBanner';
import { useQuery } from '@tanstack/react-query';
import { getChallenges } from '../../lib/challenges';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface MatchesListProps {
  userId: string;
}

export default function MatchesList({ userId }: MatchesListProps) {
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['user-matches', userId],
    queryFn: () => {
      // Get both user and team challenges where the user is involved
      const userChallenges = getChallenges('user', userId);
      const teamChallenges = getChallenges('team', userId);
      return [...userChallenges, ...teamChallenges].sort((a, b) => 
        b.scheduledDate.getTime() - a.scheduledDate.getTime()
      );
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      {/* Upcoming Matches */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-4">Upcoming Matches</h2>
        <div className="space-y-4">
          {matches?.filter(match => 
            match.status === 'pending' && 
            match.scheduledDate > new Date()
          ).map((match) => (
            <MatchBanner key={match.id} challenge={match} />
          ))}
        </div>
      </div>

      {/* Past Matches */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-4">Match History</h2>
        <div className="space-y-4">
          {matches?.filter(match => 
            match.status !== 'pending' || 
            match.scheduledDate <= new Date()
          ).map((match) => (
            <MatchBanner key={match.id} challenge={match} />
          ))}
        </div>
      </div>

      {matches?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No matches found
        </div>
      )}
    </div>
  );
}