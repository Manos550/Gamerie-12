import React, { useState } from 'react';
import { Game } from '../../types';
import { Trophy, Clock, Plus, Edit2, Trash2, User, Gamepad, Medal } from 'lucide-react';
import AddGameModal from './AddGameModal';
import EditGameModal from './EditGameModal';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../lib/store';
import { updateProfile } from '../../lib/profile';

interface GamesListProps {
  games: Game[];
  isEditable?: boolean;
}

export default function GamesList({ games, isEditable }: GamesListProps) {
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const { user } = useAuthStore();

  const handleDeleteGame = async (gameId: string) => {
    if (!user) return;
    
    try {
      const updatedGames = games.filter(game => game.id !== gameId);
      await updateProfile(user.id, { gamesPlayed: updatedGames });
      toast.success('Game removed successfully');
    } catch (error) {
      toast.error('Failed to remove game');
    }
  };

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl font-bold text-white">Games</h2>
          {isEditable && (
            <button
              onClick={() => setIsAddingGame(true)}
              className="flex items-center gap-2 px-3 py-1 bg-gaming-neon/10 text-gaming-neon rounded-md hover:bg-gaming-neon/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Game
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-gaming-dark/50 hover:bg-gaming-dark/70 transition-colors"
            >
              <img
                src={`https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100`}
                alt={game.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="font-display font-bold text-white">{game.name}</h3>
                  {isEditable && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingGame(game)}
                        className="text-gray-400 hover:text-gaming-neon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-gray-400 hover:text-gaming-accent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 space-y-2">
                  {/* Game Identity */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gaming-neon" />
                    <span className="text-gray-300">{game.gameUsername}</span>
                    {game.nickname && (
                      <span className="text-gaming-neon">({game.nickname})</span>
                    )}
                  </div>

                  {/* Platform */}
                  <div className="flex items-center gap-2 text-sm">
                    <Gamepad className="w-4 h-4 text-gaming-neon" />
                    <span className="text-gray-300">{game.platform}</span>
                  </div>

                  {/* Skill Level */}
                  <div className="flex items-center gap-2 text-sm">
                    <Medal className="w-4 h-4 text-gaming-neon" />
                    <span className="text-gray-300">{game.skillLevel}</span>
                    {game.rank && (
                      <span className="text-gaming-neon">• {game.rank}</span>
                    )}
                  </div>

                  {/* Hours Played */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gaming-neon" />
                    <span className="text-gray-300">{game.hoursPlayed} hours played</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {games.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No games added yet
            </div>
          )}
        </div>
      </div>

      {isAddingGame && (
        <AddGameModal onClose={() => setIsAddingGame(false)} />
      )}

      {editingGame && (
        <EditGameModal 
          game={editingGame} 
          onClose={() => setEditingGame(null)} 
        />
      )}
    </div>
  );
}