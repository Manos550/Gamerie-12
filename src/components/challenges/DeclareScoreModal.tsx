import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Trophy } from 'lucide-react';
import { Challenge } from '../../types';
import { updateChallengeStatus } from '../../lib/challenges';
import { useQueryClient } from '@tanstack/react-query';

const scoreSchema = z.object({
  score: z.string().min(1, 'Score is required'),
  notes: z.string().optional(),
  winnerId: z.string().min(1, 'Winner must be selected')
});

type ScoreFormData = z.infer<typeof scoreSchema>;

interface DeclareScoreModalProps {
  challenge: Challenge;
  onClose: () => void;
}

export default function DeclareScoreModal({ challenge, onClose }: DeclareScoreModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema)
  });

  const onSubmit = async (data: ScoreFormData) => {
    try {
      await updateChallengeStatus(challenge.id, 'completed', {
        winnerId: data.winnerId,
        score: data.score,
        notes: data.notes
      });

      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      onClose();
    } catch (error) {
      console.error('Error updating match score:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gaming-neon" />
            <h2 className="font-display text-xl font-bold text-white">Declare Match Result</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Winner
            </label>
            <select
              {...register('winnerId')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select winner</option>
              {challenge.type === 'user' ? (
                <>
                  <option value={challenge.challengerId}>{challenge.challengerName}</option>
                  <option value={challenge.challengedId}>{challenge.challengedName}</option>
                </>
              ) : (
                <>
                  <option value={challenge.challengerTeamId}>{challenge.challengerTeamName}</option>
                  <option value={challenge.challengedTeamId}>{challenge.challengedTeamName}</option>
                </>
              )}
            </select>
            {errors.winnerId && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.winnerId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Score
            </label>
            <input
              {...register('score')}
              type="text"
              placeholder="e.g., 2-1"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            />
            {errors.score && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.score.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Add any notes about the match..."
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}