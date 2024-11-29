import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { updateProfile } from '../../lib/profile';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { getDemoGame } from '../../lib/search';

const needSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  game: z.string().min(1, 'Game is required'),
  description: z.string().min(1, 'Description is required'),
});

type NeedFormData = z.infer<typeof needSchema>;

interface AddNeedModalProps {
  onClose: () => void;
}

export default function AddNeedModal({ onClose }: AddNeedModalProps) {
  const { user } = useAuthStore();

  // Fetch available games
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NeedFormData>({
    resolver: zodResolver(needSchema)
  });

  const onSubmit = async (data: NeedFormData) => {
    if (!user) return;

    try {
      const newNeed = {
        ...data,
        active: true,
        createdAt: new Date()
      };

      const updatedNeeds = [...(user.needs || []), newNeed];
      await updateProfile(user.id, { needs: updatedNeeds });

      toast.success('Looking For request added successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to add request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gaming-card rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Add Looking For Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select type</option>
              <option value="Looking for Team">Looking for Team</option>
              <option value="Looking for Players">Looking for Players</option>
              <option value="Looking for Coach">Looking for Coach</option>
              <option value="Looking for Practice Partner">Looking for Practice Partner</option>
              <option value="Looking for Tournament">Looking for Tournament</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
              placeholder="Describe what you're looking for..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
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
              {isSubmitting ? 'Adding...' : 'Add Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}