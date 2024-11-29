import React from 'react';
import { Challenge } from '../../types';
import { format } from 'date-fns';
import { Trophy, Calendar, Clock, Gamepad, Flag } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import DeclareScoreModal from './DeclareScoreModal';
import ReportButton from '../shared/ReportButton';

interface MatchBannerProps {
  challenge: Challenge;
}

export default function MatchBanner({ challenge }: MatchBannerProps) {
  const { user } = useAuthStore();
  const [showDeclareScore, setShowDeclareScore] = React.useState(false);
  const isCompleted = challenge.status === 'completed';

  // Check if user can declare score (is participant or team leader)
  const canDeclareScore = user && (
    challenge.type === 'user' 
      ? (user.id === challenge.challengerId || user.id === challenge.challengedId)
      : (challenge.challengerTeamId === user.teams[0]?.teamId || challenge.challengedTeamId === user.teams[0]?.teamId)
  );

  return (
    <div className="bg-gaming-dark/50 rounded-lg p-4 border border-gaming-neon/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-white">
            {challenge.type === 'user' 
              ? `${challenge.challengerName} vs ${challenge.challengedName}`
              : `${challenge.challengerTeamName} vs ${challenge.challengedTeamName}`}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
            <div className="flex items-center gap-1">
              <Gamepad className="w-4 h-4 text-gaming-neon" />
              <span>{challenge.game}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gaming-neon" />
              <span>{format(challenge.scheduledDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gaming-neon" />
              <span>{format(challenge.scheduledDate, 'h:mm a')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {challenge.stakes && (
            <div className="flex items-center gap-2 bg-gaming-neon/10 px-3 py-1 rounded-lg">
              <Trophy className="w-4 h-4 text-gaming-neon" />
              <span className="text-gaming-neon text-sm">{challenge.stakes}</span>
            </div>
          )}
          {user && (
            <ReportButton
              contentId={challenge.id}
              contentType="match"
              contentAuthorId={challenge.type === 'user' ? challenge.challengerId! : challenge.initiatedBy!}
            />
          )}
        </div>
      </div>

      {isCompleted && challenge.result ? (
        <div className="mt-4 p-3 bg-gaming-dark/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gaming-neon" />
              <span className="text-white">
                Winner: {challenge.type === 'user' 
                  ? (challenge.result.winnerId === challenge.challengerId ? challenge.challengerName : challenge.challengedName)
                  : (challenge.result.winnerId === challenge.challengerTeamId ? challenge.challengerTeamName : challenge.challengedTeamName)
                }
              </span>
            </div>
            <span className="text-gaming-neon font-bold">{challenge.result.score}</span>
          </div>
          {challenge.result.notes && (
            <p className="text-gray-400 text-sm mt-2">{challenge.result.notes}</p>
          )}
        </div>
      ) : canDeclareScore && (
        <button
          onClick={() => setShowDeclareScore(true)}
          className="mt-4 w-full px-4 py-2 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors"
        >
          Declare Score
        </button>
      )}

      {showDeclareScore && (
        <DeclareScoreModal
          challenge={challenge}
          onClose={() => setShowDeclareScore(false)}
        />
      )}
    </div>
  );
}