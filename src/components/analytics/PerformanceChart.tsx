import React from 'react';
import { GameStats } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getPerformanceTrend } from '../../lib/analytics';

interface PerformanceChartProps {
  stats: GameStats;
}

export default function PerformanceChart({ stats }: PerformanceChartProps) {
  const trend = getPerformanceTrend(stats);
  const recentMatches = stats.matchHistory.slice(-10);

  return (
    <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-white">Recent Performance</h3>
        <div className="flex items-center gap-2">
          {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
          {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
          {trend === 'stable' && <Minus className="w-5 h-5 text-yellow-500" />}
          <span className="text-sm text-gray-400">Last 10 matches</span>
        </div>
      </div>

      <div className="flex gap-1">
        {recentMatches.map((match, index) => (
          <div
            key={index}
            className={`h-20 flex-1 rounded-sm ${
              match.result === 'win'
                ? 'bg-green-500'
                : match.result === 'loss'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
            style={{
              height: `${(match.score / 100) * 80}px`
            }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-sm text-gray-400">Wins</div>
          <div className="text-lg font-bold text-green-500">
            {recentMatches.filter(m => m.result === 'win').length}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Losses</div>
          <div className="text-lg font-bold text-red-500">
            {recentMatches.filter(m => m.result === 'loss').length}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Draws</div>
          <div className="text-lg font-bold text-yellow-500">
            {recentMatches.filter(m => m.result === 'draw').length}
          </div>
        </div>
      </div>
    </div>
  );
}