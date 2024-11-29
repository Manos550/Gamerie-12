import React from 'react';
import { User } from '../../types';
import { Activity, Medal, MessageSquare, TrendingUp } from 'lucide-react';

interface QuickStatsProps {
  user: User;
}

export default function QuickStats({ user }: QuickStatsProps) {
  const stats = [
    {
      icon: <Activity className="w-5 h-5 text-gaming-neon" />,
      label: 'Win Rate',
      value: `${calculateWinRate(user.stats)}%`,
    },
    {
      icon: <Medal className="w-5 h-5 text-gaming-neon" />,
      label: 'Tournament Wins',
      value: user.stats.tournamentWins,
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-gaming-neon" />,
      label: 'Teams',
      value: user.teams.length,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-gaming-neon" />,
      label: 'Matches Played',
      value: user.stats.matchesPlayed,
    },
  ];

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 overflow-hidden">
      <div className="p-6">
        <h2 className="font-display text-xl font-bold text-white mb-6">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gaming-dark mb-3">
                {stat.icon}
              </div>
              <div className="font-display font-bold text-2xl text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function calculateWinRate(stats: User['stats']): number {
  if (stats.matchesPlayed === 0) return 0;
  return Math.round((stats.wins / stats.matchesPlayed) * 100);
}