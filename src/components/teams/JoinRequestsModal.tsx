import React from 'react';
import { X, Check, X as XIcon } from 'lucide-react';
import { Team, TeamJoinRequest } from '../../types';
import { acceptJoinRequest, rejectJoinRequest } from '../../lib/teams';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface JoinRequestsModalProps {
  team: Team;
  onClose: () => void;
}

export default function JoinRequestsModal({ team, onClose }: JoinRequestsModalProps) {
  const queryClient = useQueryClient();
  const [requests] = React.useState<TeamJoinRequest[]>([
    // Demo requests
    {
      id: '1',
      userId: 'user-1',
      teamId: team.id,
      status: 'pending',
      message: 'I would love to join your team!',
      createdAt: new Date()
    }
  ]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptJoinRequest(requestId);
      queryClient.invalidateQueries({ queryKey: ['team', team.id] });
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectJoinRequest(requestId);
      queryClient.invalidateQueries({ queryKey: ['team', team.id] });
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Join Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No pending join requests</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://via.placeholder.com/40"
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-white">User Name</div>
                    <div className="text-sm text-gray-400">
                      Requested {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                    </div>
                    {request.message && (
                      <p className="text-sm text-gray-300 mt-1">{request.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="p-2 text-gaming-neon hover:bg-gaming-neon/10 rounded-full transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="p-2 text-gaming-accent hover:bg-gaming-accent/10 rounded-full transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}