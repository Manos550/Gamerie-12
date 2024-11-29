import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Team } from '../../types';
import { Users, Trophy, Calendar, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../lib/store';
import { sendTeamJoinRequest } from '../../lib/teams';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { DEFAULT_TEAM_LOGO, DEFAULT_TEAM_BACKGROUND, getDemoTeams } from '../../lib/teams';

export default function TeamsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDemoMode = import.meta.env.MODE === 'development';

  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (isDemoMode) {
        return getDemoTeams();
      }

      const teamsQuery = query(collection(db, 'teams'));
      const snapshot = await getDocs(teamsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
    }
  });

  const handleJoinRequest = async (teamId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to team profile
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await sendTeamJoinRequest(teamId);
    } catch (error) {
      console.error('Error sending join request:', error);
    }
  };

  const isTeamMember = (team: Team) => {
    return user && team.members.some(member => member.userId === user.id);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-display font-bold text-white">Teams</h1>
        <button
          onClick={() => navigate('/teams/create')}
          className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 transition-colors"
        >
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.map((team) => (
          <Link
            key={team.id}
            to={`/teams/${team.id}`}
            className="bg-gaming-card rounded-lg overflow-hidden border border-gaming-neon/20 hover:border-gaming-neon transition-colors group"
          >
            <div className="h-32 relative">
              <img
                src={team.backgroundImage || DEFAULT_TEAM_BACKGROUND}
                alt={team.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gaming-card to-transparent" />
              <img
                src={team.logo || DEFAULT_TEAM_LOGO}
                alt={`${team.name} logo`}
                className="absolute -bottom-6 left-4 w-16 h-16 rounded-lg border-2 border-gaming-card"
              />
            </div>

            <div className="p-4 pt-8">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">
                    {team.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {team.description}
                  </p>
                </div>
                {!isTeamMember(team) && (
                  <button
                    onClick={(e) => handleJoinRequest(team.id, e)}
                    className="px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon hover:text-black transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Join</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{team.members.length} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>{team.stats.tournamentWins} wins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {teams?.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">No teams found. Create your first team!</p>
          </div>
        )}
      </div>
    </div>
  );
}