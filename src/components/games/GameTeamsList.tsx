import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Team } from '../../types';
import { Link } from 'react-router-dom';
import { Users, Trophy } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';

interface GameTeamsListProps {
  gameId: string;
  teams: string[];
}

export default function GameTeamsList({ gameId, teams }: GameTeamsListProps) {
  const { data: teamsList, isLoading, error } = useQuery({
    queryKey: ['game-teams', gameId],
    queryFn: async () => {
      // In demo mode, return mock data
      if (import.meta.env.MODE === 'development') {
        return Array(5).fill(null).map((_, i) => ({
          id: `team-${i}`,
          name: `Team ${i}`,
          logo: 'https://via.placeholder.com/40',
          members: Array(Math.floor(Math.random() * 5) + 3),
          stats: {
            wins: Math.floor(Math.random() * 100),
            losses: Math.floor(Math.random() * 50),
            tournamentWins: Math.floor(Math.random() * 10)
          }
        }));
      }

      const teamPromises = teams.map(async (teamId) => {
        const docRef = doc(db, 'teams', teamId);
        const docSnap = await getDoc(docRef);
        return { id: docSnap.id, ...docSnap.data() } as Team;
      });

      return Promise.all(teamPromises);
    },
    enabled: teams.length > 0
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="bg-gaming-card rounded-lg p-6">
      <h2 className="font-display text-xl font-bold text-white mb-6">Teams</h2>

      <div className="grid gap-4">
        {teamsList?.map((team) => (
          <Link
            key={team.id}
            to={`/teams/${team.id}`}
            className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark transition-colors"
          >
            <div className="flex items-center gap-4">
              <img
                src={team.logo}
                alt={team.name}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="font-display font-bold text-white">{team.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{team.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span>{team.stats.tournamentWins} tournament wins</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {teamsList?.length === 0 && (
          <p className="text-center py-4 text-gray-400">
            No teams playing this game yet
          </p>
        )}
      </div>
    </div>
  );
}