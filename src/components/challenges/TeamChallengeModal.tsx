import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Team } from '../../types';
import { createChallenge } from '../../lib/challenges';
import { useAuthStore } from '../../lib/store';
import { useQuery } from '@tanstack/react-query';
import { getDemoGame } from '../../lib/search';
import { getDemoTeams } from '../../lib/teams';
import MatchBanner from './MatchBanner';

const challengeSchema = z.object({
  challengerTeamId: z.string().min(1, 'Please select your team'),
  game: z.string().min(1, 'Game selection is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  format: z.string().min(1, 'Format is required'),
  teamSize: z.string().min(1, 'Team size is required'),
  stakes: z.string().optional(),
  message: z.string().optional()
});

type ChallengeFormData = z.infer<typeof challengeSchema>;

interface TeamChallengeModalProps {
  targetTeam: Team;
  onClose: () => void;
}

export default function TeamChallengeModal({ targetTeam, onClose }: TeamChallengeModalProps) {
  const { user } = useAuthStore();

  // Get all teams where user is a leader
  const { data: userTeams } = useQuery({
    queryKey: ['user-leader-teams', user?.id],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        const teams = getDemoTeams();
        return teams.filter(t => t.members.some(m => 
          m.userId === user?.id && 
          (m.role === 'Leader' || m.role === 'owner')
        ));
      }
      return [];
    },
    enabled: !!user
  });

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

  const selectedTeamId = watch('challengerTeamId');
  const selectedTeam = userTeams?.find(t => t.id === selectedTeamId);

  const watchedFields = {
    game: watch('game'),
    date: watch('date'),
    time: watch('time'),
    format: watch('format'),
    teamSize: watch('teamSize'),
    stakes: watch('stakes'),
    message: watch('message')
  };

  const showPreview = selectedTeam && watchedFields.game && watchedFields.date && watchedFields.time;

  const onSubmit = async (data: ChallengeFormData) => {
    if (!user || !selectedTeam) return;

    try {
      await createChallenge({
        type: 'team',
        challengerTeamId: selectedTeam.id,
        challengerTeamName: selectedTeam.name,
        challengedTeamId: targetTeam.id,
        challengedTeamName: targetTeam.name,
        initiatedBy: user.id,
        game: data.game,
        scheduledDate: new Date(`${data.date}T${data.time}`),
        format: data.format,
        teamSize: parseInt(data.teamSize),
        stakes: data.stakes,
        message: data.message,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      onClose();
    } catch (error) {
      console.error('Error sending team challenge:', error);
    }
  };

  if (!userTeams?.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gaming-card rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">No Teams Available</h2>
            <p className="text-gray-400 mb-6">
              You must be a team leader or owner to challenge other teams.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gaming-neon text-black rounded-md hover:bg-gaming-neon/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gaming-card rounded-lg p-6 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">
            Challenge {targetTeam.name}
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
              Select Your Team
            </label>
            <select
              {...register('challengerTeamId')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select team</option>
              {userTeams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {errors.challengerTeamId && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.challengerTeamId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Game
            </label>
            <select
              {...register('game')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select game</option>
              {selectedTeam?.games.map((game) => (
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
              Team Size
            </label>
            <select
              {...register('teamSize')}
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
            >
              <option value="">Select size</option>
              <option value="1">1v1</option>
              <option value="2">2v2</option>
              <option value="3">3v3</option>
              <option value="4">4v4</option>
              <option value="5">5v5</option>
            </select>
            {errors.teamSize && (
              <p className="mt-1 text-sm text-gaming-accent">{errors.teamSize.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Stakes (Optional)
            </label>
            <input
              {...register('stakes')}
              type="text"
              placeholder="e.g., Prize pool or bragging rights"
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
              placeholder="Any additional details or team message..."
              className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
            />
          </div>

          {showPreview && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Match Preview</h3>
              <MatchBanner
                challenge={{
                  type: 'team',
                  challengerTeamId: selectedTeam.id,
                  challengerTeamName: selectedTeam.name,
                  challengedTeamId: targetTeam.id,
                  challengedTeamName: targetTeam.name,
                  initiatedBy: user?.id || '',
                  game: watchedFields.game,
                  scheduledDate: new Date(`${watchedFields.date}T${watchedFields.time}`),
                  format: watchedFields.format || '',
                  teamSize: parseInt(watchedFields.teamSize || '0'),
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
              {isSubmitting ? 'Sending...' : 'Send Team Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}