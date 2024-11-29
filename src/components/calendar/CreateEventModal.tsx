import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { createEvent } from '../../lib/events';
import { EventType } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getDemoTeams } from '../../lib/teams';
import { getDemoGame } from '../../lib/search';

const eventSchema = z.object({
  type: z.enum(['match', 'practice', 'tournament', 'team_meeting'] as const),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  game: z.string().optional(),
  team: z.string().optional(),
  location: z.string().optional()
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventModalProps {
  onClose: () => void;
}

export default function CreateEventModal({ onClose }: CreateEventModalProps) {
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

  // Fetch user's teams
  const { data: teams } = useQuery({
    queryKey: ['user-teams', user?.id],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        const allTeams = getDemoTeams();
        return allTeams.filter(team => 
          team.members.some(member => member.userId === user?.id)
        );
      }
      return [];
    },
    enabled: !!user
  });

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  });

  const selectedType = watch('type');

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;

    try {
      await createEvent({
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        participants: [user.id],
        status: 'upcoming',
        reminders: [],
        createdBy: user.id
      });

      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gaming-card rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Create Event</h2>
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
              Event Type
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="match">Match</option>
              <option value="practice">Practice</option>
              <option value="tournament">Tournament</option>
              <option value="team_meeting">Team Meeting</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              placeholder="Event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Time
              </label>
              <input
                {...register('startTime')}
                type="datetime-local"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-gaming-accent">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Time
              </label>
              <input
                {...register('endTime')}
                type="datetime-local"
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-gaming-accent">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {(selectedType === 'match' || selectedType === 'practice' || selectedType === 'tournament') && (
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
            </div>
          )}

          {(selectedType === 'match' || selectedType === 'practice' || selectedType === 'team_meeting') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Team
              </label>
              <select
                {...register('team')}
                className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              >
                <option value="">Select team</option>
                {teams?.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              {...register('location')}
              type="text"
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
              placeholder="Event location (e.g., Discord, TeamSpeak)"
            />
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
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}