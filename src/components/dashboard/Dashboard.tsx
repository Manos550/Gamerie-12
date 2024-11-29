import React from 'react';
import { useAuthStore } from '../../lib/store';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Newspaper, Activity, Medal, MessageSquare, TrendingUp } from 'lucide-react';
import QuickStats from './QuickStats';
import UpcomingEvents from './UpcomingEvents';
import ActivityFeed from './ActivityFeed';
import RecommendedTeams from './RecommendedTeams';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">
          Welcome back, <span className="text-gaming-neon">{user.username}</span>
        </h1>
        <p className="text-gray-400 mt-2">Your gaming journey continues...</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          to="/tournaments"
          icon={<Trophy />}
          title="Tournaments"
          description="Join or create tournaments"
        />
        <QuickActionCard
          to="/teams"
          icon={<Users />}
          title="Teams"
          description="Manage your teams"
        />
        <QuickActionCard
          to="/calendar"
          icon={<Calendar />}
          title="Events"
          description="View upcoming events"
        />
        <QuickActionCard
          to="/news"
          icon={<Newspaper />}
          title="News"
          description="Latest gaming updates"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <QuickStats user={user} />
          <ActivityFeed userId={user.id} />
        </div>

        {/* Right Column - Events & Recommendations */}
        <div className="space-y-8">
          <UpcomingEvents userId={user.id} />
          <RecommendedTeams userId={user.id} />
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickActionCard({ to, icon, title, description }: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className="bg-gaming-card p-6 rounded-lg border border-gaming-neon/20 hover:border-gaming-neon/50 transition-all group"
    >
      <div className="text-gaming-neon mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-display font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  );
}