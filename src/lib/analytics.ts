import { User, GameStats, ActivityStats } from '../types';

// Calculate win rate percentage
export const calculateWinRate = (stats: GameStats): number => {
  if (stats.matchesPlayed === 0) return 0;
  return Math.round((stats.wins / stats.matchesPlayed) * 100);
};

// Calculate KD ratio
export const calculateKDRatio = (stats: GameStats): number => {
  if (stats.deaths === 0) return stats.kills;
  return Number((stats.kills / stats.deaths).toFixed(2));
};

// Calculate average score
export const calculateAverageScore = (stats: GameStats): number => {
  if (stats.matchesPlayed === 0) return 0;
  return Math.round(stats.totalScore / stats.matchesPlayed);
};

// Calculate activity score (0-100)
export const calculateActivityScore = (stats: ActivityStats): number => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  
  const recentActivity = stats.activityHistory.filter(
    activity => new Date(activity.date) >= thirtyDaysAgo
  );

  const score = Math.min(
    100,
    Math.round(
      (recentActivity.length / 30) * 100 +
      (stats.postsLastMonth / 10) * 20 +
      (stats.commentsLastMonth / 20) * 10 +
      (stats.tournamentsLastMonth * 15)
    )
  );

  return score;
};

// Get performance trend
export const getPerformanceTrend = (stats: GameStats): 'up' | 'down' | 'stable' => {
  const recentMatches = stats.matchHistory.slice(-10);
  const wins = recentMatches.filter(match => match.result === 'win').length;
  const winRate = (wins / recentMatches.length) * 100;
  
  if (winRate > 60) return 'up';
  if (winRate < 40) return 'down';
  return 'stable';
};

// Calculate rank progress
export const calculateRankProgress = (stats: GameStats): number => {
  const currentRankPoints = stats.rankPoints || 0;
  const pointsPerRank = 100;
  return (currentRankPoints % pointsPerRank) / pointsPerRank * 100;
};

// Get player strengths
export const getPlayerStrengths = (user: User): string[] => {
  const strengths: string[] = [];
  
  if (user.stats.wins / user.stats.matchesPlayed > 0.6) {
    strengths.push('Consistent Winner');
  }
  
  if (user.stats.tournamentWins > 5) {
    strengths.push('Tournament Expert');
  }
  
  if (user.teams.length > 2) {
    strengths.push('Team Player');
  }
  
  if (user.achievements.length > 10) {
    strengths.push('Achievement Hunter');
  }

  return strengths;
};

// Get improvement suggestions
export const getImprovementSuggestions = (stats: GameStats): string[] => {
  const suggestions: string[] = [];
  
  if (stats.wins / stats.matchesPlayed < 0.4) {
    suggestions.push('Focus on improving win rate');
  }
  
  if (stats.deaths > stats.kills) {
    suggestions.push('Work on survival skills');
  }
  
  if (stats.assists < stats.kills * 0.3) {
    suggestions.push('Try to support teammates more');
  }

  return suggestions;
};