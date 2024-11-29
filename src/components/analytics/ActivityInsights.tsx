import React from 'react';
import { ActivityStats } from '../../types';
import { calculateActivityScore } from '../../lib/analytics';
import { Users, MessageSquare, Trophy } from 'lucide-react';

interface ActivityInsightsProps {
  stats: ActivityStats;
}

export default function ActivityInsights({ stats }: ActivityInsightsProps) {
  const activityScore = calculateActivityScore(stats);

  return (
    <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
      <h3 className="font-display text-lg font-bold text-white mb-4">Activity Insights</h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Activity Score</span>
          <span className="text-sm text-gaming-neon">{activityScore}/100</span>
        </div>
        <div className="h-2 bg-gaming-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gaming-neon transition-all duration-500"
            style={{ width: `${activityScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gaming-dark mb-2">
            <MessageSquare className="w-5 h-5 text-gaming-neon" />
          </div>
          <div className="text-lg font-bold text-white">{stats.postsLastMonth}</div>
          <div className="text-sm text-gray-400">Posts</div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gaming-dark mb-2">
            <Users className="w-5 h-5 text-gaming-neon" />
          </div>
          <div className="text-lg font-bold text-white">{stats.commentsLastMonth}</div>
          <div className="text-sm text-gray-400">Comments</div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gaming-dark mb-2">
            <Trophy className="w-5 h-5 text-gaming-neon" />
          </div>
          <div className="text-lg font-bold text-white">{stats.tournamentsLastMonth}</div>
          <div className="text-sm text-gray-400">Tournaments</div>
        </div>
      </div>
    </div>
  );
}