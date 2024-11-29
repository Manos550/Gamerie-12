import React from 'react';
import { User } from '../../types';
import { Trophy, TrendingUp, Medal, Star } from 'lucide-react';

interface PlayerRankingsProps {
  user: User;
}

export default function PlayerRankings({ user }: PlayerRankingsProps) {
  // Calculate win rate
  const winRate = user.stats.matchesPlayed > 0 
    ? Math.round((user.stats.wins / user.stats.matchesPlayed) * 100) 
    : 0;

  // Calculate rank based on stats
  const calculateRank = () => {
    const points = (user.stats.wins * 2) + 
                  (user.stats.tournamentWins * 10) - 
                  (user.stats.losses * 0.5);
    
    if (points >= 1000) return { title: 'Elite', color: 'text-yellow-400' };
    if (points >= 500) return { title: 'Veteran', color: 'text-purple-400' };
    if (points >= 250) return { title: 'Expert', color: 'text-blue-400' };
    if (points >= 100) return { title: 'Advanced', color: 'text-green-400' };
    return { title: 'Rookie', color: 'text-gray-400' };
  };

  const rank = calculateRank();

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-gaming-neon" />
        <h2 className="font-display text-xl font-bold text-white">Player Rankings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rank Card */}
        <div className="bg-gaming-dark/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Current Rank</span>
            <div className={`flex items-center gap-2 ${rank.color}`}>
              <Medal className="w-5 h-5" />
              <span className="font-bold">{rank.title}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-white font-bold">{winRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tournament Wins</span>
              <span className="text-white font-bold">{user.stats.tournamentWins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Matches</span>
              <span className="text-white font-bold">{user.stats.matchesPlayed}</span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-gaming-dark/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Performance</span>
            <div className="flex items-center gap-2 text-gaming-neon">
              <Star className="w-5 h-5" />
              <span className="font-bold">Stats</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Win/Loss Ratio */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Win/Loss Ratio</span>
                <span className="text-white">
                  {user.stats.wins}/{user.stats.losses}
                </span>
              </div>
              <div className="h-2 bg-gaming-dark rounded-full overflow-hidden">
                <div
                  className="h-full bg-gaming-neon"
                  style={{
                    width: `${(user.stats.wins / (user.stats.wins + user.stats.losses)) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Recent Performance */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Recent Performance</span>
                <span className="text-white">Last 10 matches</span>
              </div>
              <div className="flex gap-1">
                {Array(10).fill(null).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      Math.random() > 0.3 ? 'bg-gaming-neon' : 'bg-gaming-dark'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}