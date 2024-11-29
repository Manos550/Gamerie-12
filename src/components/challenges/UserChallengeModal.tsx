import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { createChallenge } from '../../lib/challenges';
import { useQuery } from '@tanstack/react-query';
import { getDemoGame } from '../../lib/search';
import MatchBanner from './MatchBanner';

const challengeSchema = z.object({
  game: z.string().min(1, 'Game selection is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  format: z.string().min(1, 'Format is required'),
  stakes: z.string().optional(),
  message: z.string().optional()
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface UserChallengeModalProps {
  targetUserId: string;
  targetUsername: string;
  onClose: () => void;
}

export default function UserChallengeModal({ 
  targetUserId, 
  targetUsername, 
  onClose 
}: UserChallengeModalProps) {
  const { user } = useAuthStore();

  // Get available games
  const { data: games } = useQuery({
    queryKey: ['available-games'],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        const gameIds = ['lol', 'dota2', 'valorant', 'fifa', 'cod', 'wow'];
        const games = await Promise.all(
          gameIds.map(id => getDemoGame(id))
        );
        return games.filter(Boolean);
      }
      return [];
    }
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema)
  });

  const watchedFields = {
    game: watch('game'),
    date: watch('date'),
    time: watch('time'),
    format: watch('format'),
    stakes: watch('stakes'),
    message: watch('message')
  };

  const showPreview = watchedFields.game && watchedFields.date && watchedFields.time;

  const onSubmit = async (data: ChallengeFormData) => {
    if (!user) return;

    try {
      await createChallenge({
        type: 'user',
        challengerId: user.id,
        challengerName: user.username,
        challengedId: targetUserId,
        challengedName: targetUsername,
        game: data.game,
        scheduledDate: new Date(`${data.date}T${data.time}`),
        format: data.format,
        stakes: data.stakes,
        message: data.message,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      onClose();
    } catch (error) {
      console.error('Error sending challenge:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Challenge {targetUsername}
          </h2>
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
              Game
            </label>
            <select
              {...register('game')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select game</option>
              {games?.map((game) => (
                <option key={game.id} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
            {errors.game && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.game.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-gaming-accent">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Time
              </label>
              <input
                {...register('time')}
                type="time"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-gaming-accent">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Format
            </label>
            <select
              {...register('format')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select format</option>
              <option value="Best of 1">Best of 1</option>
              <option value="Best of 3">Best of 3</option>
              <option value="Best of 5">Best of 5</option>
              <option value="Custom">Custom</option>
            </select>
            {errors.format && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.format.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Stakes (Optional)
            </label>
            <input
              {...register('stakes')}
              type="text"
              placeholder="e.g., Winner gets bragging rights"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message (Optional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Any additional details or trash talk..."
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
            />
          </div>

          {showPreview && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Match Preview</h3>
              <MatchBanner
                challenge={{
                  type: 'user',
                  challengerId: user?.id || '',
                  challengerName: user?.username || '',
                  challengedId: targetUserId,
                  challengedName: targetUsername,
                  game: watchedFields.game,
                  scheduledDate: new Date(`${watchedFields.date}T${watchedFields.time}`),
                  format: watchedFields.format || '',
                  stakes: watchedFields.stakes,
                  message: watchedFields.message,
                  status: 'pending',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }}
              />
            </div>
          )}

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
              {isSubmitting ? 'Sending...' : 'Send Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}