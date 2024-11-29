import React from 'react';
import { GameStats } from '../../types';
import { calculateRankProgress } from '../../lib/analytics';
import { Trophy } from 'lucide-react';

interface RankProgressProps {
  stats: GameStats;
}

export default function RankProgress({ stats }: RankProgressProps) {
  const progress = calculateRankProgress(stats);

  return (
    <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gaming-neon" />
          <h3 className="font-display text-lg font-bold text-white">Rank Progress</h3>
        </div>
        <div className="text-sm text-gray-400">
          {stats.rankPoints} points
        </div>
      </div>

      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gaming-neon bg-gaming-dark">
              Progress to Next Rank
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gaming-neon">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gaming-dark">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gaming-neon transition-all duration-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center mt-6">
        <div>
          <div className="text-sm text-gray-400">Current Rank</div>
          <div className="text-lg font-bold text-white">{stats.currentRank}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Peak Rank</div>
          <div className="text-lg font-bold text-white">{stats.peakRank}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Global Position</div>
          <div className="text-lg font-bold text-white">#{stats.globalRanking}</div>
        </div>
      </div>
    </div>
  );
}