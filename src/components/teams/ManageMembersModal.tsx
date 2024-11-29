import React from 'react';
import { X, Shield, UserMinus } from 'lucide-react';
import { Team, TeamMemberRole } from '../../types';
import { updateMemberRole, removeMember } from '../../lib/teams';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { getDemoUser } from '../../lib/demo-data';

interface ManageMembersModalProps {
  team: Team;
  onClose: () => void;
}

export default function ManageMembersModal({ team, onClose }: ManageMembersModalProps) {
  const queryClient = useQueryClient();

  // Fetch member details
  const { data: memberDetails } = useQuery({
    queryKey: ['team-members', team.members],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        return Promise.all(
          team.members.map(async (member) => {
            const user = getDemoUser(member.userId);
            return {
              ...member,
              user: user || {
                username: 'Unknown User',
                profileImage: 'https://via.placeholder.com/40'
              }
            };
          })
        );
      }
      return [];
    }
  });

  const handleRoleChange = async (userId: string, newRole: TeamMemberRole) => {
    try {
      await updateMemberRole(team.id, userId, newRole);
      queryClient.invalidateQueries({ queryKey: ['team', team.id] });
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMember(team.id, userId);
        queryClient.invalidateQueries({ queryKey: ['team', team.id] });
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Manage Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {memberDetails?.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50"
            >
              <div className="flex items-center gap-3">
                <img
                  src={member.user.profileImage}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-white">{member.user.username}</div>
                  <div className="text-sm text-gaming-neon">{member.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.userId, e.target.value as TeamMemberRole)}
                  className="px-3 py-1 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                >
                  <option value="Leader">Leader</option>
                  <option value="Deputy Leader">Deputy Leader</option>
                  <option value="Chief">Chief</option>
                  <option value="Founding Member">Founding Member</option>
                  <option value="Member">Member</option>
                </select>

                {member.userId !== team.ownerId && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-2 text-gaming-accent hover:bg-gaming-accent/10 rounded-full transition-colors"
                  >
                    <UserMinus className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}