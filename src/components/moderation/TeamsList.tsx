import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Team } from '../../types';
import { getDemoTeams } from '../../lib/teams';
import { Search, Shield, Trash2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TeamsList() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: teams } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        return getDemoTeams();
      }
      return [];
    }
  });

  const filteredTeams = teams?.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      // Implement team deletion
      console.log('Delete team:', teamId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">Teams</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams..."
            className="pl-9 pr-4 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTeams?.map((team) => (
          <div
            key={team.id}
            className="bg-gaming-dark/50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={team.logo}
                alt={team.name}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="font-bold text-white">{team.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {team.members.length} members
                  </div>
                  <span>•</span>
                  <div>
                    Created {formatDistanceToNow(team.createdAt, { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {team.level}
              </div>
              <button
                onClick={() => handleDeleteTeam(team.id)}
                className="flex items-center gap-2 px-3 py-1 bg-gaming-accent/10 text-gaming-accent rounded-md hover:bg-gaming-accent/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}