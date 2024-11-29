import React from 'react';
import { UserStats } from '../../types';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';

interface ProfileStatsProps {
  stats: UserStats;
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const winRate = stats.matchesPlayed > 0 
    ? Math.round((stats.wins / stats.matchesPlayed) * 100) 
    : 0;

  const statItems = [
    {
      icon: <Trophy className="w-6 h-6 text-gaming-neon" />,
      label: 'Tournament Wins',
      value: stats.tournamentWins,
    },
    {
      icon: <Target className="w-6 h-6 text-gaming-neon" />,
      label: 'Win Rate',
      value: `${winRate}%`,
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-gaming-neon" />,
      label: 'Matches Played',
      value: stats.matchesPlayed,
    },
    {
      icon: <Award className="w-6 h-6 text-gaming-neon" />,
      label: 'Win/Loss/Draw',
      value: `${stats.wins}/${stats.losses}/${stats.draws}`,
    },
  ];

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Statistics</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gaming-dark mb-3">
                {item.icon}
              </div>
              <div className="font-display font-bold text-2xl text-white mb-1">
                {item.value}
              </div>
              <div className="text-sm text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}