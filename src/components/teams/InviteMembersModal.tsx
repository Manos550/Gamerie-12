import React, { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { Team } from '../../types';
import { inviteMember } from '../../lib/teams';
import { useQueryClient } from '@tanstack/react-query';
import { search } from '../../lib/search';
import { useDebounce } from '../../hooks/useDebounce';

interface InviteMembersModalProps {
  team: Team;
  onClose: () => void;
}

export default function InviteMembersModal({ team, onClose }: InviteMembersModalProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [searchResults, setSearchResults] = useState<any[]>([]);

  React.useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        const results = await search(debouncedSearchTerm);
        setSearchResults(results.users.filter(user => 
          !team.members.some(member => member.userId === user.id)
        ));
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, team.members]);

  const handleInvite = async (userId: string) => {
    try {
      await inviteMember(team.id, userId);
      queryClient.invalidateQueries({ queryKey: ['team', team.id] });
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Invite Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
          />
        </div>

        <div className="space-y-4">
          {isSearching ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gaming-neon border-t-transparent mx-auto"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center py-4 text-gray-400">
              {searchTerm ? 'No users found' : 'Start typing to search for users'}
            </p>
          ) : (
            searchResults.map((user) => (
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
                    <div className="text-sm text-gray-400">{user.gamerTitle}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleInvite(user.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon hover:text-black transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}