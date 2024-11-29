import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Game, Platform } from '../../types';
import { updateProfile } from '../../lib/profile';
import { useAuthStore } from '../../lib/store';
import { useQuery } from '@tanstack/react-query';
import { getDemoGame } from '../../lib/search';
import { toast } from 'react-toastify';

const gameSchema = z.object({
  platform: z.enum(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'] as const, {
    required_error: 'Platform selection is required'
  }),
  skillLevel: z.string().min(1, 'Skill level is required'),
  hoursPlayed: z.number().min(0, 'Hours must be 0 or greater'),
  rank: z.string().optional(),
  nickname: z.string().optional(),
  gameUsername: z.string().min(1, 'Game username is required')
});

type GameFormData = z.infer<typeof gameSchema>;

interface EditGameModalProps {
  game: Game;
  onClose: () => void;
}

export default function EditGameModal({ game, onClose }: EditGameModalProps) {
  const { user } = useAuthStore();

  // Fetch game details
  const { data: gameDetails } = useQuery({
    queryKey: ['game-details', game.id],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        const details = await getDemoGame(game.id);
        if (!details) throw new Error('Game not found');
        return details;
      }
      return null;
    }
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      platform: game.platform,
      skillLevel: game.skillLevel,
      hoursPlayed: game.hoursPlayed,
      rank: game.rank,
      nickname: game.nickname,
      gameUsername: game.gameUsername
    }
  });

  const onSubmit = async (data: GameFormData) => {
    if (!user) return;

    try {
      const updatedGames = user.gamesPlayed.map(g => 
        g.id === game.id ? { ...g, ...data } : g
      );

      await updateProfile(user.id, {
        gamesPlayed: updatedGames
      });

      toast.success('Game updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="relative bg-gaming-card rounded-lg p-6 max-w-md w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Edit Game</h2>
            <p className="text-gray-400">{game.name}</p>
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
            <label htmlFor="gameUsername" className="block text-sm font-medium text-gray-300 mb-1">
              Game Username/ID *
            </label>
            <input
              {...register('gameUsername')}
              type="text"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              placeholder="Enter your in-game username"
            />
            {errors.gameUsername && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.gameUsername.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">
              Nickname (Optional)
            </label>
            <input
              {...register('nickname')}
              type="text"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              placeholder="Enter your nickname in this game"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Platform
            </label>
            <select
              {...register('platform')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              {gameDetails?.platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            {errors.platform && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.platform.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-300 mb-1">
              Skill Level
            </label>
            <select
              {...register('skillLevel')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select skill level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
              <option value="pro">Pro</option>
            </select>
            {errors.skillLevel && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.skillLevel.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="hoursPlayed" className="block text-sm font-medium text-gray-300 mb-1">
              Hours Played
            </label>
            <input
              {...register('hoursPlayed', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            />
            {errors.hoursPlayed && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.hoursPlayed.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="rank" className="block text-sm font-medium text-gray-300 mb-1">
              Current Rank (optional)
            </label>
            <input
              {...register('rank')}
              type="text"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              placeholder="Enter your current rank"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}