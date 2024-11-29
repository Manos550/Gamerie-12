import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GamePage as GamePageType } from '../../types';
import { Users, Gamepad, Globe, ExternalLink, Radio, Eye, Brain, Gamepad2, UserPlus } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { getDemoGame } from '../../lib/search';
import { demoUsers } from '../../lib/demo-data';

export default function GamePage() {
  const { gameId } = useParams();
  const isDemoMode = import.meta.env.MODE === 'development';

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (isDemoMode) {
        const game = await getDemoGame(gameId!);
        if (!game) throw new Error('Game not found');
        return game;
      }

      const docRef = doc(db, 'games', gameId!);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Game not found');
      }
      
      return { id: docSnap.id, ...docSnap.data() } as GamePageType;
    },
    enabled: Boolean(gameId)
  });

  // Get count of users who have this game
  const { data: userCount } = useQuery({
    queryKey: ['game-users-count', gameId],
    queryFn: async () => {
      if (isDemoMode) {
        return demoUsers.filter(user => 
          user.gamesPlayed.some(game => game.id === gameId)
        ).length;
      }
      return 0;
    },
    enabled: Boolean(gameId)
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!game) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12">
        <img
          src={game.wallPhoto}
          alt={game.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-gaming-dark/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-display font-bold text-white mb-4">
              {game.name}
            </h1>
            <div className="flex items-center gap-6 text-lg text-gray-300 mb-8">
              <span>{game.company}</span>
              <span>•</span>
              <span>{game.gameType}</span>
              <span>•</span>
              <div className="flex items-center gap-2 text-gaming-neon">
                <UserPlus className="w-5 h-5" />
                <span>{userCount || 0} players</span>
              </div>
            </div>
            <p className="text-xl text-gray-200 mb-8 line-clamp-3">
              {game.description}
            </p>
            <a
              href={game.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gaming-neon text-black rounded-lg hover:bg-gaming-neon/90 transition-colors text-lg font-medium"
            >
              <Globe className="w-5 h-5" />
              Official Website
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10 hover:border-gaming-neon/30 transition-colors">
          <div className="text-gaming-neon mb-4">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {game.followers_stats.total.toLocaleString()}
          </div>
          <div className="text-gray-400">Total Players</div>
        </div>

        <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10 hover:border-gaming-neon/30 transition-colors">
          <div className="text-gaming-neon mb-4">
            <Gamepad className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {game.followers_stats.active_gamers.toLocaleString()}
          </div>
          <div className="text-gray-400">Active Players</div>
        </div>

        <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10 hover:border-gaming-neon/30 transition-colors">
          <div className="text-gaming-neon mb-4">
            <Radio className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {game.followers_stats.streamers.toLocaleString()}
          </div>
          <div className="text-gray-400">Streamers</div>
        </div>

        <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10 hover:border-gaming-neon/30 transition-colors">
          <div className="text-gaming-neon mb-4">
            <Eye className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {game.followers_stats.spectators.toLocaleString()}
          </div>
          <div className="text-gray-400">Spectators</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Game Info */}
        <div className="col-span-2 space-y-8">
          {/* Game Modes */}
          <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-gaming-neon" />
              Game Modes
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {game.gameModes.map((mode, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gaming-dark/50 text-white hover:bg-gaming-dark/70 transition-colors"
                >
                  {mode}
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-gaming-neon" />
              <h2 className="text-2xl font-display font-bold text-white">Required Skills</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {game.requiredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{skill}</span>
                    <div className="w-24 h-2 bg-gaming-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gaming-neon"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Platforms */}
          <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Platforms</h2>
            <div className="flex flex-wrap gap-3">
              {game.platforms.map((platform) => (
                <span
                  key={platform}
                  className="px-4 py-2 rounded-lg bg-gaming-dark/50 text-gaming-neon font-medium hover:bg-gaming-dark/70 transition-colors"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gaming-card rounded-xl p-8 border border-gaming-neon/10">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Connect</h2>
            <div className="space-y-3">
              {game.socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark group transition-colors"
                >
                  <span className="text-gray-400 group-hover:text-white transition-colors">
                    {social.platform}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gaming-neon" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}