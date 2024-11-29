import React, { useState } from 'react';
import { User } from '../../types';
import { Info, Trophy, MessageSquare, Star, Swords } from 'lucide-react';
import GamerInfo from './GamerInfo';
import ProfileStats from './ProfileStats';
import MyGames from './MyGames';
import MyTeams from './MyTeams';
import NeedsSection from './NeedsSection';
import PlatformsList from './PlatformsList';
import SocialLinks from './SocialLinks';
import SkillsEndorsements from './SkillsEndorsements';
import ProfilePosts from './ProfilePosts';
import PlayerRankings from './PlayerRankings';
import AchievementsDisplay from './AchievementsDisplay';
import MatchesList from './MatchesList';

interface ProfileTabsProps {
  profile: User;
  isOwnProfile: boolean;
}

type TabType = 'info' | 'games' | 'wall' | 'achievements' | 'matches';

export default function ProfileTabs({ profile, isOwnProfile }: ProfileTabsProps) {
  const [currentTab, setCurrentTab] = useState<TabType>('info');

  const tabs = [
    { id: 'info' as const, label: 'My Info', icon: <Info className="w-4 h-4" /> },
    { id: 'games' as const, label: 'My Games', icon: <Trophy className="w-4 h-4" /> },
    { id: 'matches' as const, label: 'Matches', icon: <Swords className="w-4 h-4" /> },
    { id: 'wall' as const, label: 'Wall Post', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'achievements' as const, label: 'Achievements', icon: <Star className="w-4 h-4" /> }
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'info':
        return (
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="bg-gaming-card rounded-lg border border-gaming-neon/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-gaming-neon" />
                <h2 className="font-display text-xl font-bold text-white">About</h2>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{profile.bio || 'No bio yet'}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <GamerInfo user={profile} />
                <PlatformsList platforms={profile.platforms} />
                <SocialLinks 
                  socialMedia={profile.socialMedia} 
                  gamingAccounts={profile.gamingAccounts} 
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <PlayerRankings user={profile} />
                <SkillsEndorsements 
                  skills={profile.skills} 
                  onEndorse={() => {}} 
                />
                <NeedsSection needs={profile.needs} isEditable={isOwnProfile} />
              </div>
            </div>
          </div>
        );

      case 'games':
        return (
          <div className="space-y-6">
            <MyGames 
              games={profile.gamesPlayed}
              isEditable={isOwnProfile}
            />
            <MyTeams userId={profile.id} />
          </div>
        );

      case 'matches':
        return <MatchesList userId={profile.id} />;

      case 'wall':
        return (
          <ProfilePosts 
            userId={profile.id}
            isOwnProfile={isOwnProfile}
          />
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <AchievementsDisplay user={profile} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gaming-neon/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-display font-medium transition-colors relative ${
              currentTab === tab.id
                ? 'text-gaming-neon'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {currentTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-neon" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}