import React from 'react';
import { Skill } from '../../types';
import { ThumbsUp, Brain, Star, TrendingUp, Target, Zap } from 'lucide-react';
import { useAuthStore } from '../../lib/store';

interface SkillsEndorsementsProps {
  skills: Skill[];
  onEndorse: (skillName: string) => void;
}

export default function SkillsEndorsements({ skills, onEndorse }: SkillsEndorsementsProps) {
  const { user } = useAuthStore();

  // Helper function to get a random color for the skill visualization
  const getSkillColor = (index: number) => {
    const colors = [
      'from-[#00ff9d] to-[#00cc7e]',
      'from-[#ff3864] to-[#cc2d50]',
      'from-[#00a8ff] to-[#0084cc]',
      'from-[#ffd700] to-[#ccac00]',
      'from-[#9c27b0] to-[#7b1fa2]',
      'from-[#ff6b6b] to-[#cc5555]'
    ];
    return colors[index % colors.length];
  };

  // Helper function to get a random icon for the skill
  const getSkillIcon = (index: number) => {
    const icons = [Brain, Star, TrendingUp, Target, Zap];
    const Icon = icons[index % icons.length];
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
      <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6 text-gaming-neon" />
        Gaming Skills
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((skill, index) => {
          const hasEndorsed = user && skill.endorsements.some(e => e.userId === user.id);
          const endorsementPercentage = Math.min(100, (skill.endorsements.length / 10) * 100);

          return (
            <div
              key={skill.name}
              className="bg-gaming-dark/30 rounded-lg p-4 relative overflow-hidden group"
            >
              {/* Background Gradient Animation */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getSkillColor(index)} opacity-5 group-hover:opacity-10 transition-opacity`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="text-gaming-neon">
                      {getSkillIcon(index)}
                    </div>
                    <h3 className="font-display font-bold text-white">
                      {skill.name}
                    </h3>
                  </div>
                  
                  {user && (
                    <button
                      onClick={() => onEndorse(skill.name)}
                      disabled={hasEndorsed}
                      className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                        hasEndorsed
                          ? 'bg-gaming-neon/20 text-gaming-neon cursor-default'
                          : 'bg-gaming-neon/10 text-gaming-neon hover:bg-gaming-neon/20'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">
                        {hasEndorsed ? 'Endorsed' : 'Endorse'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Skill Level Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mastery Level</span>
                    <span className="text-gaming-neon font-bold">
                      {endorsementPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gaming-dark rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getSkillColor(index)} transition-all duration-500`}
                      style={{ width: `${endorsementPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">
                      {skill.endorsements.length} endorsements
                    </span>
                    <div className="flex -space-x-2">
                      {skill.endorsements.slice(0, 3).map((endorsement, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-gaming-dark border-2 border-gaming-card"
                        />
                      ))}
                      {skill.endorsements.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gaming-dark border-2 border-gaming-card flex items-center justify-center">
                          <span className="text-xs text-gaming-neon">
                            +{skill.endorsements.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}