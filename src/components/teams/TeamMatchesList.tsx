import React from 'react';
import { Challenge } from '../../types';
import MatchBanner from '../challenges/MatchBanner';
import { useQuery } from '@tanstack/react-query';
import { getChallenges } from '../../lib/challenges';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface TeamMatchesListProps {
  teamId: string;
}

export default function TeamMatchesList({ teamId }: TeamMatchesListProps) {
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['team-matches', teamId],
    queryFn: () => {
      // Get team challenges
      const teamChallenges = getChallenges('team', teamId);
      return teamChallenges.sort((a, b) => 
        b.scheduledDate.getTime() - a.scheduledDate.getTime()
      );
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  const upcomingMatches = matches?.filter(match => 
    match.status === 'pending' && 
    match.scheduledDate > new Date()
  ) || [];

  const pastMatches = matches?.filter(match => 
    match.status !== 'pending' || 
    match.scheduledDate <= new Date()
  ) || [];

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
      {/* Upcoming Matches */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-white mb-4">Upcoming Matches</h2>
        <div className="space-y-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map((match) => (
              <MatchBanner key={match.id} challenge={match} />
            ))
          ) : (
            <p className="text-center py-4 text-gray-400">No upcoming matches</p>
          )}
        </div>
      </div>

      {/* Past Matches */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-4">Match History</h2>
        <div className="space-y-4">
          {pastMatches.length > 0 ? (
            pastMatches.map((match) => (
              <MatchBanner key={match.id} challenge={match} />
            ))
          ) : (
            <p className="text-center py-4 text-gray-400">No past matches</p>
          )}
        </div>
      </div>
    </div>
  );
}