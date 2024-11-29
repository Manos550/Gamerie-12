import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Plus, X, Upload } from 'lucide-react';
import { createGame, updateGame, deleteGame } from '../../lib/games';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GamePage } from '../../types';
import { getDemoGame } from '../../lib/search';
import { toast } from 'react-toastify';

const gameSchema = z.object({
  id: z.string().min(1, 'Game ID is required'),
  name: z.string().min(1, 'Game name is required'),
  description: z.string().min(1, 'Description is required'),
  company: z.string().min(1, 'Company name is required'),
  gameType: z.string().min(1, 'Game type is required'),
  gameModes: z.array(z.string()).min(1, 'At least one game mode is required'),
  requiredSkills: z.array(z.string()).default([]),
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  socialMedia: z.array(z.object({
    platform: z.string(),
    url: z.string().url()
  })).default([]),
  officialWebsite: z.string().url('Must be a valid URL'),
  wallPhoto: z.any().optional()
});

type GameFormData = z.infer<typeof gameSchema>;

export default function GameManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGame, setEditingGame] = useState<GamePage | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [gameModesInput, setGameModesInput] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const queryClient = useQueryClient();

  const { data: games } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const gameIds = ['cs2', 'lol', 'dota2', 'valorant', 'fifa', 'cod', 'wow'];
      const games = await Promise.all(
        gameIds.map(id => getDemoGame(id))
      );
      return games.filter(Boolean) as GamePage[];
    }
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema)
  });

  const wallPhotoFile = watch('wallPhoto');

  React.useEffect(() => {
    if (wallPhotoFile?.length) {
      const url = URL.createObjectURL(wallPhotoFile[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [wallPhotoFile]);

  React.useEffect(() => {
    if (editingGame) {
      setValue('id', editingGame.id);
      setValue('name', editingGame.name);
      setValue('description', editingGame.description);
      setValue('company', editingGame.company);
      setValue('gameType', editingGame.gameType);
      setValue('gameModes', editingGame.gameModes);
      setValue('requiredSkills', editingGame.requiredSkills);
      setValue('platforms', editingGame.platforms);
      setValue('socialMedia', editingGame.socialMedia);
      setValue('officialWebsite', editingGame.officialWebsite);
      setPreview(editingGame.wallPhoto);
      setGameModesInput(editingGame.gameModes.join(', '));
      setRequiredSkillsInput(editingGame.requiredSkills.join(', '));
    }
  }, [editingGame, setValue]);

  const onSubmit = async (data: GameFormData) => {
    try {
      if (editingGame) {
        await updateGame(editingGame.id, {
          ...data,
          wallPhoto: data.wallPhoto?.[0]
        });
      } else {
        await createGame({
          ...data,
          wallPhoto: data.wallPhoto?.[0]
        });
      }

      queryClient.invalidateQueries({ queryKey: ['games'] });
      reset();
      setPreview(null);
      setShowCreateModal(false);
      setEditingGame(null);
      toast.success(editingGame ? 'Game updated successfully' : 'Game created successfully');
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game');
    }
  };

  const handleDelete = async (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(gameId);
        queryClient.invalidateQueries({ queryKey: ['games'] });
        toast.success('Game deleted successfully');
      } catch (error) {
        console.error('Error deleting game:', error);
        toast.error('Failed to delete game');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingGame(null);
    reset();
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-gaming-neon" />
          <h2 className="font-display text-xl font-bold text-white">Game Management</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90"
        >
          <Plus className="w-4 h-4" />
          Add Game
        </button>
      </div>

      <div className="grid gap-4">
        {games?.map((game) => (
          <div
            key={game.id}
            className="bg-gaming-dark/50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={game.wallPhoto}
                alt={game.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-bold text-white">{game.name}</h3>
                <p className="text-sm text-gray-400">{game.gameType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingGame(game)}
                className="px-3 py-1 text-gaming-neon hover:bg-gaming-neon/10 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(game.id)}
                className="px-3 py-1 text-gaming-accent hover:bg-gaming-accent/10 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {(showCreateModal || editingGame) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-white">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Game ID
                  </label>
                  <input
                    {...register('id')}
                    type="text"
                    disabled={!!editingGame}
                    className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon disabled:opacity-50"
                  />
                  {errors.id && (
                    <p className="mt-1 text-sm text-gaming-accent">{errors.id.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Game Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-gaming-accent">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    {...register('company')}
                    type="text"
                    className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-gaming-accent">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Game Type
                  </label>
                  <input
                    {...register('gameType')}
                    type="text"
                    className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                  />
                  {errors.gameType && (
                    <p className="mt-1 text-sm text-gaming-accent">{errors.gameType.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Game Modes (comma-separated)
                </label>
                <input
                  type="text"
                  value={gameModesInput}
                  onChange={(e) => {
                    setGameModesInput(e.target.value);
                    const modes = e.target.value.split(',')
                      .map(mode => mode.trim())
                      .filter(Boolean);
                    setValue('gameModes', modes);
                  }}
                  placeholder="e.g., Competitive, Casual, Battle Royale"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
                {errors.gameModes && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.gameModes.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={requiredSkillsInput}
                  onChange={(e) => {
                    setRequiredSkillsInput(e.target.value);
                    const skills = e.target.value.split(',')
                      .map(skill => skill.trim())
                      .filter(Boolean);
                    setValue('requiredSkills', skills);
                  }}
                  placeholder="e.g., Aim, Strategy, Teamwork"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Platforms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'].map((platform) => (
                    <label
                      key={platform}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gaming-dark/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={platform}
                        {...register('platforms')}
                        className="rounded border-gaming-neon/20 text-gaming-neon focus:ring-gaming-neon bg-gaming-dark"
                      />
                      <span className="text-white">{platform}</span>
                    </label>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.platforms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Official Website
                </label>
                <input
                  {...register('officialWebsite')}
                  type="url"
                  className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                />
                {errors.officialWebsite && (
                  <p className="mt-1 text-sm text-gaming-accent">{errors.officialWebsite.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Wall Photo
                </label>
                <div className="relative group">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gaming-dark/50 rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gaming-neon" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                    <input
                      type="file"
                      {...register('wallPhoto')}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-white">Change Image</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : editingGame ? 'Save Changes' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}