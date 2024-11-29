import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Challenge } from '../../types';
import { getChallenges } from '../../lib/challenges';
import { Search, Shield, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DeclareScoreModal from '../challenges/DeclareScoreModal';
import MatchBanner from '../challenges/MatchBanner';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { toast } from 'react-toastify';

export default function MatchManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMatch, setEditingMatch] = useState<Challenge | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Get all matches (both user and team challenges)
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: () => {
      // Pass empty string to get all matches
      return getChallenges('', '');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  const filteredMatches = matches?.filter(match => {
    const searchMatch = match.type === 'user' ? (
      match.challengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.challengedName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : (
      match.challengerTeamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.challengedTeamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statusMatch = filter === 'all' || 
      (filter === 'completed' && match.status === 'completed') ||
      (filter === 'pending' && match.status !== 'completed');

    return searchMatch && statusMatch;
  });

  const handleDeleteMatch = async (matchId: string) => {
    if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      try {
        await getChallenges(matchId);
        toast.success('Match deleted successfully');
      } catch (error) {
        toast.error('Failed to delete match');
        console.error('Delete match error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">Matches</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search matches..."
              className="pl-9 pr-4 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md ${
                filter === 'all'
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-md ${
                filter === 'pending'
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-md ${
                filter === 'completed'
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMatches?.map((match) => (
          <div key={match.id} className="relative">
            <MatchBanner challenge={match} />
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setEditingMatch(match)}
                className="px-3 py-1 text-sm bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20"
              >
                Edit Score
              </button>
              <button
                onClick={() => handleDeleteMatch(match.id)}
                className="px-3 py-1 text-sm bg-gaming-accent/10 text-gaming-accent rounded-md hover:bg-gaming-accent/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredMatches?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No matches found
          </div>
        )}
      </div>

      {editingMatch && (
        <DeclareScoreModal
          challenge={editingMatch}
          onClose={() => setEditingMatch(null)}
        />
      )}
    </div>
  );
}