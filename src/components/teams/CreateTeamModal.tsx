import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Globe, Clock } from 'lucide-react';
import { TeamLevel, TeamPlatform, TeamGame } from '../../types';
import { createTeam } from '../../lib/teams';
import { useAuthStore } from '../../lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

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
  })).optional(),
  platforms: z.array(z.enum(['PC', 'XBOX', 'PS5', 'Switch', 'Mobile'])).optional(),
  socialMedia: z.array(z.object({
    platform: z.string(),
    url: z.string().url()
  })).optional(),
  teamMessage: z.string().optional(),
  customTemplate: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    font: z.string().optional()
  }).optional()
});

type TeamFormData = z.infer<typeof teamSchema>;

interface CreateTeamModalProps {
  onClose: () => void;
}

export default function CreateTeamModal({ onClose }: CreateTeamModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgVideoFile, setBgVideoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema)
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
    if (!user) return;

    try {
      const newTeam = {
        name: data.name,
        description: data.description || `Team ${data.name}'s official page`,
        country: data.country || 'Not specified',
        region: data.region || null,
        timezone: data.timezone || 'UTC+0',
        level: data.level || 'Amateur',
        games: data.games || [],
        platforms: data.platforms || ['PC'],
        members: [{
          userId: user.id,
          role: 'owner',
          joinedAt: new Date()
        }],
        ownerId: user.id,
        followers: [],
        socialMedia: data.socialMedia?.filter(sm => sm.platform && sm.url) || [],
        teamMessage: data.teamMessage || null,
        customTemplate: data.customTemplate || null,
        stats: {
          wins: 0,
          losses: 0,
          draws: 0,
          tournamentWins: 0,
          matchesPlayed: 0,
          ranking: 0
        }
      };

      await createTeam(newTeam, {
        logo: logoFile || undefined,
        background: bgFile || undefined,
        video: bgVideoFile || undefined
      });

      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Create Team</h2>
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
                  src={logoPreview || 'https://via.placeholder.com/150'}
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
                  src={bgPreview || 'https://via.placeholder.com/150'}
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
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}