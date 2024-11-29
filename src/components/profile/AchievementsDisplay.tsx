import React from 'react';
import { User } from '../../types';
import { Trophy, Star, Calendar, Medal, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface AchievementsDisplayProps {
  user: User;
}

export default function AchievementsDisplay({ user }: AchievementsDisplayProps) {
  // Group achievements by game
  const achievementsByGame = user.achievements.reduce((acc, achievement) => {
    const game = achievement.game;
    if (!acc[game]) acc[game] = [];
    acc[game].push(achievement);
    return acc;
  }, {} as Record<string, typeof user.achievements>);

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-gaming-neon" />
        <h2 className="font-display text-xl font-bold text-white">Achievements</h2>
      </div>

      {Object.entries(achievementsByGame).map(([game, achievements]) => (
        <div key={game} className="mb-6 last:mb-0">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-gaming-neon" />
            {game}
          </h3>

          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gaming-dark/50 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-gaming-neon" />
                    <h4 className="font-bold text-white">{achievement.title}</h4>
                  </div>
                  {achievement.proof && (
                    <a
                      href={achievement.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gaming-neon hover:text-gaming-neon/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-gray-400 text-sm">{achievement.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{format(achievement.date, 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {user.achievements.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No achievements yet</p>
        </div>
      )}
    </div>
  );
}