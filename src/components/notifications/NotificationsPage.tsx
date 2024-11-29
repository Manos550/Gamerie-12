import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Users, Trophy, Heart, MessageSquare, Star, UserPlus } from 'lucide-react';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorDisplay from '../shared/ErrorDisplay';
import { markNotificationAsRead } from '../../lib/notifications';

type NotificationType = 'follow' | 'like' | 'comment' | 'team' | 'achievement' | 'mention';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id, filter],
    queryFn: async () => {
      if (import.meta.env.MODE === 'development') {
        // Return demo notifications
        return Array(10).fill(null).map((_, i) => ({
          id: `notification-${i}`,
          type: ['follow', 'like', 'comment', 'team', 'achievement', 'mention'][
            Math.floor(Math.random() * 6)
          ] as NotificationType,
          message: [
            'started following you',
            'liked your post',
            'commented on your post',
            'invited you to join their team',
            'earned a new achievement',
            'mentioned you in a comment'
          ][Math.floor(Math.random() * 6)],
          link: '#',
          isRead: Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 7) // Random date within last 7 days
        }));
      }

      let q = query(
        collection(db, 'notifications'),
        where('userId', '==', user?.id),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(q, where('type', '==', filter));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Notification[];
    },
    enabled: !!user
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-5 h-5 text-gaming-neon" />;
      case 'like':
        return <Heart className="w-5 h-5 text-gaming-accent" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-gaming-neon" />;
      case 'team':
        return <Users className="w-5 h-5 text-gaming-neon" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-gaming-neon" />;
      case 'mention':
        return <Star className="w-5 h-5 text-gaming-neon" />;
      default:
        return <Bell className="w-5 h-5 text-gaming-neon" />;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
    window.location.href = notification.link;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Notifications</h1>
        
        <div className="flex gap-2">
          {(['all', 'follow', 'like', 'comment', 'team', 'achievement', 'mention'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === type
                  ? 'bg-gaming-neon text-black'
                  : 'bg-gaming-dark text-white hover:bg-gaming-neon/20'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {notifications?.map((notification) => (
          <button
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              notification.isRead
                ? 'bg-gaming-card hover:bg-gaming-card/80'
                : 'bg-gaming-dark border border-gaming-neon/20 hover:border-gaming-neon'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-${notification.isRead ? 'gray-300' : 'white'}`}>
                  {notification.message}
                </p>
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                </span>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-gaming-neon" />
              )}
            </div>
          </button>
        ))}

        {notifications?.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}