import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, UserCheck } from 'lucide-react';
import { Team } from '../../types';
import { transferOwnership } from '../../lib/teams';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { search } from '../../lib/search';
import LoadingSpinner from '../shared/LoadingSpinner';

interface TransferOwnershipModalProps {
  team: Team;
  onClose: () => void;
}

export default function TransferOwnershipModal({ team, onClose }: TransferOwnershipModalProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['team-members-search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];
      setIsSearching(true);
      try {
        const results = await search(debouncedSearchTerm);
        return results.users.filter(user => 
          team.members.some(member => member.userId === user.id) && 
          user.id !== team.ownerId
        );
      } finally {
        setIsSearching(false);
      }
    },
    enabled: Boolean(debouncedSearchTerm)
  });

  const handleTransfer = async (newOwnerId: string) => {
    if (window.confirm('Are you sure you want to transfer ownership of this team? This action cannot be undone.')) {
      try {
        await transferOwnership(team.id, newOwnerId);
        navigate('/teams');
      } catch (error) {
        console.error('Error transferring ownership:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Transfer Team Ownership</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Select a team member to transfer ownership to. This action cannot be undone.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
            />
          </div>
        </div>

        <div className="space-y-4">
          {isLoading || isSearching ? (
            <LoadingSpinner />
          ) : searchResults?.length === 0 ? (
            <p className="text-center py-4 text-gray-400">
              {searchTerm ? 'No members found' : 'Start typing to search for team members'}
            </p>
          ) : (
            searchResults?.map((user) => {
              const member = team.members.find(m => m.userId === user.id);
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profileImage || 'https://via.placeholder.com/40'}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-white">{user.username}</div>
                      <div className="text-sm text-gaming-neon">{member?.role}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTransfer(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon hover:text-black transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Transfer Ownership
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}