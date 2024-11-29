import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Globe, Clock, Plus, Trash2 } from 'lucide-react';
import { Team, Platform } from '../../types';
import { updateTeam } from '../../lib/teams';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { getDemoGame } from '../../lib/search';

const teamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  description: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  timezone: z.string().optional(),
  level: z.enum(['Hobbyist', 'Amateur', 'Competitor', 'Pro']).optional(),
  games: z.array(z.object({
    id: z.string(),
    name: z.string(),
    platforms: z.array(z.enum(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile']))
  })),
  platforms: z.array(z.enum(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'])),
  teamMessage: z.string().optional()
});

type TeamFormData = z.infer<typeof teamSchema>;

interface EditTeamModalProps {
  team: Team;
  onClose: () => void;
}

export default function EditTeamModal({ team, onClose }: EditTeamModalProps) {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

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

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team.name,
      description: team.description,
      country: team.country,
      region: team.region,
      timezone: team.timezone,
      level: team.level,
      games: team.games,
      platforms: team.platforms,
      teamMessage: team.teamMessage
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'games'
  });

  const handleFileChange = (
    file: File | null,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    try {
      await updateTeam(team.id, {
        ...data,
        logo: logoFile ? await handleImageUpload(logoFile, 'logo') : undefined,
        backgroundImage: bgFile ? await handleImageUpload(bgFile, 'background') : undefined,
        backgroundVideo: bgVideoFile ? await handleVideoUpload(bgVideoFile) : undefined
      });

      queryClient.invalidateQueries({ queryKey: ['team', team.id] });
      toast.success('Team updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'background'): Promise<string> => {
    // In a real app, implement file upload to storage
    return URL.createObjectURL(file);
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    // In a real app, implement video upload to storage
    return URL.createObjectURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Edit Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Media Upload Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Team Logo
              </label>
              <div className="relative group">
                <img
                  src={logoPreview || team.logo || 'https://via.placeholder.com/150'}
                  alt="Team Logo"
                  className="w-full h-32 rounded-lg object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleFileChange(file || null, setLogoFile, setLogoPreview);
                    }}
                  />
                  <Upload className="w-6 h-6 text-white" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Image
              </label>
              <div className="relative group">
                <img
                  src={bgPreview || team.backgroundImage || 'https://via.placeholder.com/150'}
                  alt="Background"
                  className="w-full h-32 rounded-lg object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleFileChange(file || null, setBgFile, setBgPreview);
                    }}
                  />
                  <Upload className="w-6 h-6 text-white" />
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Team Name *
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
            />
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Globe className="inline-block w-4 h-4 mr-1" />
                Country
              </label>
              <input
                {...register('country')}
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Region
              </label>
              <input
                {...register('region')}
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Clock className="inline-block w-4 h-4 mr-1" />
                Timezone
              </label>
              <input
                {...register('timezone')}
                type="text"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                placeholder="UTC+0"
              />
            </div>
          </div>

          {/* Team Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Team Level
            </label>
            <select
              {...register('level')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="Hobbyist">Hobbyist</option>
              <option value="Amateur">Amateur</option>
              <option value="Competitor">Competitor</option>
              <option value="Pro">Pro</option>
            </select>
          </div>

          {/* Games Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Games
            </label>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4">
                  <div className="flex-1 space-y-4">
                    <select
                      {...register(`games.${index}.id`)}
                      className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
                    >
                      <option value="">Select game</option>
                      {availableGames?.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex flex-wrap gap-2">
                      {(['PC', 'PS5', 'XBOX', 'Switch', 'Mobile'] as Platform[]).map((platform) => (
                        <label
                          key={platform}
                          className="flex items-center gap-2 p-2 rounded-lg bg-gaming-dark/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            {...register(`games.${index}.platforms`)}
                            value={platform}
                            className="rounded border-gaming-neon/20 text-gaming-neon focus:ring-gaming-neon bg-gaming-dark"
                          />
                          <span className="text-white">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 h-fit text-gaming-accent hover:bg-gaming-accent/10 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => append({ id: '', name: '', platforms: [] })}
                className="flex items-center gap-2 px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20"
              >
                <Plus className="w-4 h-4" />
                Add Game
              </button>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Team Platforms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'] as Platform[]).map((platform) => (
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
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}