import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface BasicInfoTabProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export default function BasicInfoTab({ register, errors }: BasicInfoTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
          Username
        </label>
        <input
          {...register('username')}
          type="text"
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-gaming-accent">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="gamerTitle" className="block text-sm font-medium text-gray-300 mb-1">
          Gamer Title
        </label>
        <select
          {...register('gamerTitle')}
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        >
          <option value="Player">Player</option>
          <option value="Streamer">Streamer</option>
          <option value="Spectator">Spectator</option>
          <option value="Coach">Coach</option>
          <option value="Trainer">Trainer</option>
          <option value="Analyst">Analyst</option>
        </select>
      </div>

      <div>
        <label htmlFor="gameLevel" className="block text-sm font-medium text-gray-300 mb-1">
          Game Level
        </label>
        <select
          {...register('gameLevel')}
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon"
        >
          <option value="Hobbyist">Hobbyist</option>
          <option value="Amateur">Amateur</option>
          <option value="Competitor">Competitor</option>
          <option value="Pro">Pro</option>
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          {...register('bio')}
          rows={3}
          className="w-full px-3 py-2 rounded-md bg-gaming-dark border border-gaming-neon/20 text-white focus:outline-none focus:border-gaming-neon resize-none"
        />
      </div>
    </div>
  );
}