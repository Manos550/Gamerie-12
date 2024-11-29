import { Tournament, TournamentPlatform } from '../types';

// Demo tournament platforms
export const tournamentPlatforms: TournamentPlatform[] = [
  {
    name: 'FACEIT',
    url: 'https://www.faceit.com',
    logo: 'https://assets.faceit.com/default_avatar.jpg',
    description: 'Leading competitive gaming platform for online multiplayer games',
    supportedGames: ['CS:GO', 'Dota 2', 'League of Legends']
  },
  {
    name: 'ESL Play',
    url: 'https://play.eslgaming.com',
    logo: 'https://eslplay.com/logo.png',
    description: 'The world\'s largest esports company',
    supportedGames: ['CS:GO', 'Dota 2', 'Valorant', 'League of Legends']
  },
  {
    name: 'Battlefy',
    url: 'https://battlefy.com',
    logo: 'https://battlefy.com/logo.png',
    description: 'The premier destination for competitive gaming communities',
    supportedGames: ['League of Legends', 'Valorant', 'Dota 2']
  }
];

// Demo tournaments data
const demoTournaments: Tournament[] = [
  {
    id: 'faceit-lol-1',
    platform: 'FACEIT',
    platformUrl: 'https://www.faceit.com/en/lol/tournament/123',
    game: 'League of Legends',
    name: 'FACEIT LoL Spring Championship',
    description: 'Join the biggest LoL tournament of the spring season!',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-17'),
    prizePool: '$10,000',
    registrationDeadline: new Date('2024-03-10'),
    format: 'Double Elimination',
    teamSize: 5,
    currentTeams: 24,
    maxTeams: 32,
    region: 'Europe',
    skillLevel: 'Advanced',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'
  },
  {
    id: 'esl-valorant-1',
    platform: 'ESL Play',
    platformUrl: 'https://play.eslgaming.com/valorant/tournament/456',
    game: 'Valorant',
    name: 'ESL Valorant Pro Series',
    description: 'Weekly professional Valorant tournament series',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-21'),
    prizePool: '$5,000',
    registrationDeadline: new Date('2024-03-18'),
    format: 'Single Elimination',
    teamSize: 5,
    currentTeams: 12,
    maxTeams: 16,
    region: 'North America',
    skillLevel: 'Professional',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80'
  },
  {
    id: 'battlefy-dota-1',
    platform: 'Battlefy',
    platformUrl: 'https://battlefy.com/dota2/tournament/789',
    game: 'Dota 2',
    name: 'Dota 2 Amateur League',
    description: 'Perfect tournament for amateur teams looking to compete',
    startDate: new Date('2024-03-25'),
    endDate: new Date('2024-03-26'),
    prizePool: '$2,000',
    registrationDeadline: new Date('2024-03-22'),
    format: 'Round Robin + Playoffs',
    teamSize: 5,
    currentTeams: 8,
    maxTeams: 8,
    region: 'Asia',
    skillLevel: 'Amateur',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'
  }
];

export const getRecommendedTournaments = async (userId: string) => {
  // In a real app, this would filter based on user's games, skill level, region, etc.
  return demoTournaments;
};

export const getTournamentsByGame = async (gameId: string) => {
  return demoTournaments.filter(t => t.game.toLowerCase() === gameId);
};