import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Search } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { updateProfile } from '../../lib/profile';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { getDemoGame } from '../../lib/search';
import { Platform } from '../../types';

const gameSchema = z.object({
  id: z.string().min(1, 'Game selection is required'),
  name: z.string(),
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

interface AddGameModalProps {
  onClose: () => void;
}

export default function AddGameModal({ onClose }: AddGameModalProps) {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available games
  const { data: availableGames } = useQuery({
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

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      hoursPlayed: 0
    }
  });

  const selectedGameId = watch('id');
  const selectedGame = availableGames?.find(game => game.id === selectedGameId);

  // Update name when game is selected
  React.useEffect(() => {
    if (selectedGame) {
      setValue('name', selectedGame.name);
    }
  }, [selectedGame, setValue]);

  const onSubmit = async (data: GameFormData) => {
    if (!user) return;

    try {
      const updatedGames = [...(user.gamesPlayed || []), {
        id: data.id,
        name: data.name,
        platform: data.platform,
        skillLevel: data.skillLevel,
        hoursPlayed: data.hoursPlayed,
        rank: data.rank,
        nickname: data.nickname,
        gameUsername: data.gameUsername
      }];

      await updateProfile(user.id, {
        gamesPlayed: updatedGames
      });

      toast.success('Game added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding game:', error);
      toast.error('Failed to add game');
    }
  };

  const filteredGames = availableGames?.filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !user?.gamesPlayed.some(userGame => userGame.id === game.id)
  ) || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="relative bg-gaming-card rounded-lg p-6 max-w-md w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Add Game</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Game Search & Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Game
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gaming-dark border border-gaming-neon/20 text-white placeholder-gray-400 focus:outline-none focus:border-gaming-neon"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 mb-4 scrollbar-thin scrollbar-thumb-gaming-neon/20 scrollbar-track-gaming-dark">
              {filteredGames.map((game) => (
                <label
                  key={game.id}
                  className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gaming-dark/50"
                >
                  <input
                    type="radio"
                    value={game.id}
                    {...register('id')}
                    className="hidden"
                  />
                  <div className={`flex items-center gap-3 w-full p-2 rounded-lg ${
                    selectedGameId === game.id ? 'bg-gaming-neon/20 text-gaming-neon' : 'text-white'
                  }`}>
                    <img
                      src={game.wallPhoto}
                      alt={game.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-gray-400">{game.gameType}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.id && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.id.message}</p>
            )}
          </div>

          {selectedGame && (
            <>
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

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">
                  Platform
                </label>
                <select
                  {...register('platform')}
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                >
                  <option value="">Select platform</option>
                  {selectedGame.platforms.map((platform) => (
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
            </>
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
              disabled={isSubmitting || !selectedGame}
              className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}