import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { getUserNotifications } from '../../lib/notifications';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const notifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative hover:text-gaming-neon transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gaming-accent text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gaming-card rounded-lg shadow-lg border border-gaming-neon/20 z-50">
          <div className="p-4">
            <h3 className="font-display text-lg font-bold text-white mb-4">Notifications</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.link || '/notifications'}
                    className={`block p-3 rounded-lg ${
                      notification.isRead ? 'bg-gaming-dark/50' : 'bg-gaming-dark'
                    } hover:bg-gaming-dark/70 transition-colors`}
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="flex items-start gap-3">
                      {notification.image ? (
                        <img
                          src={notification.image}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gaming-neon/20 flex items-center justify-center text-gaming-neon">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <Link
                to="/notifications"
                className="block text-center text-gaming-neon hover:text-gaming-neon/80 text-sm mt-4 py-2 border-t border-gaming-neon/20"
                onClick={() => setShowDropdown(false)}
              >
                View All Notifications
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'challenge':
      return '⚔️';
    case 'match':
      return '🎮';
    case 'team_invite':
      return '👥';
    case 'follow':
      return '👋';
    case 'achievement':
      return '🏆';
    case 'recommendation':
      return '💡';
    case 'news':
      return '📰';
    default:
      return '🔔';
  }
}