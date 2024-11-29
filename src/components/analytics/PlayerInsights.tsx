import React from 'react';
import { User } from '../../types';
import { getPlayerStrengths, getImprovementSuggestions } from '../../lib/analytics';
import { Star, ArrowUp } from 'lucide-react';

interface PlayerInsightsProps {
  user: User;
}

export default function PlayerInsights({ user }: PlayerInsightsProps) {
  const strengths = getPlayerStrengths(user);
  const suggestions = getImprovementSuggestions(user.stats);

  return (
    <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-gaming-neon" />
            <h3 className="font-display text-lg font-bold text-white">Strengths</h3>
          </div>
          <div className="space-y-2">
            {strengths.map((strength, index) => (
              <div
                key={index}
                className="p-2 rounded bg-gaming-dark/50 text-sm text-white"
              >
                {strength}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUp className="w-5 h-5 text-gaming-neon" />
            <h3 className="font-display text-lg font-bold text-white">Improvement Areas</h3>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 rounded bg-gaming-dark/50 text-sm text-white"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}