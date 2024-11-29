import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../../lib/moderation';
import { Shield, Flag, Users, AlertTriangle, Gamepad2, Swords } from 'lucide-react';
import ReportsList from './ReportsList';
import OfficialPostsSection from './OfficialPostsSection';
import GameManagement from './GameManagement';
import UsersList from './UsersList';
import TeamsList from './TeamsList';
import MatchManagement from './MatchManagement';

type TabType = 'reports' | 'users' | 'teams' | 'games' | 'posts' | 'matches';

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>('reports');
  
  const { data: reports } = useQuery({
    queryKey: ['reports'],
    queryFn: () => getReports()
  });

  const pendingReports = reports?.filter(r => r.status === 'pending').length || 0;
  const resolvedReports = reports?.filter(r => r.status === 'resolved').length || 0;
  const dismissedReports = reports?.filter(r => r.status === 'dismissed').length || 0;

  const renderTabContent = () => {
    switch (currentTab) {
      case 'reports':
        return <ReportsList />;
      case 'users':
        return <UsersList />;
      case 'teams':
        return <TeamsList />;
      case 'games':
        return <GameManagement />;
      case 'posts':
        return <OfficialPostsSection />;
      case 'matches':
        return <MatchManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-gaming-neon" />
        <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Pending Reports</div>
              <div className="text-2xl font-bold text-white mt-1">{pendingReports}</div>
            </div>
            <Flag className="w-8 h-8 text-gaming-neon" />
          </div>
        </div>

        <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Resolved Reports</div>
              <div className="text-2xl font-bold text-white mt-1">{resolvedReports}</div>
            </div>
            <Users className="w-8 h-8 text-gaming-neon" />
          </div>
        </div>

        <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Dismissed Reports</div>
              <div className="text-2xl font-bold text-white mt-1">{dismissedReports}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-gaming-neon" />
          </div>
        </div>

        <div className="bg-gaming-card rounded-lg p-6 border border-gaming-neon/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Total Games</div>
              <div className="text-2xl font-bold text-white mt-1">7</div>
            </div>
            <Gamepad2 className="w-8 h-8 text-gaming-neon" />
          </div>
        </div>
      </div>

      <div className="bg-gaming-card rounded-lg border border-gaming-neon/20">
        <div className="border-b border-gaming-neon/20">
          <div className="flex gap-2 p-4">
            {(['reports', 'users', 'teams', 'games', 'posts', 'matches'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentTab === tab
                    ? 'bg-gaming-neon text-black'
                    : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
                }`}
              >
                {tab === 'matches' ? (
                  <div className="flex items-center gap-1">
                    <Swords className="w-4 h-4" />
                    <span>Matches</span>
                  </div>
                ) : (
                  tab.charAt(0).toUpperCase() + tab.slice(1)
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}