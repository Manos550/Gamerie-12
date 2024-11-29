import React from 'react';
import { Achievement } from '../../types';
import { Medal, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface AchievementsListProps {
  achievements: Achievement[];
}

export default function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Achievements</h2>

        <div className="space-y-4">
          {achievements.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No achievements yet</p>
          ) : (
            achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg bg-gaming-dark/50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-gaming-neon" />
                    <h3 className="font-display font-bold text-white">
                      {achievement.title}
                    </h3>
                  </div>
                  {achievement.proof && (
                    <a
                      href={achievement.proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gaming-neon hover:text-gaming-neon/80"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-gray-400">{achievement.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{achievement.game}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(achievement.date, 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}