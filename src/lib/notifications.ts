import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { toast } from 'react-toastify';

// Demo mode helper
const isDemoMode = import.meta.env.MODE === 'development';

// In-memory store for demo mode
let demoNotifications: any[] = [];

export type NotificationType = 
  | 'challenge' 
  | 'match' 
  | 'team_invite' 
  | 'follow' 
  | 'achievement' 
  | 'recommendation' 
  | 'news';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  image?: string;
  isRead: boolean;
  createdAt: Date;
}

export const createNotification = async (data: NotificationData): Promise<void> => {
  try {
    if (isDemoMode) {
      demoNotifications.unshift({
        id: `notification-${Date.now()}`,
        ...data,
        createdAt: new Date()
      });

      // Show toast notification
      toast(data.message, {
        type: getNotificationToastType(data.type),
        icon: getNotificationIcon(data.type)
      });

      return;
    }

    await addDoc(collection(db, 'notifications'), {
      ...data,
      createdAt: serverTimestamp()
    });

    // Show toast notification
    toast(data.message, {
      type: getNotificationToastType(data.type),
      icon: getNotificationIcon(data.type)
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    if (isDemoMode) {
      const notification = demoNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
      return;
    }

    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    if (isDemoMode) {
      demoNotifications = demoNotifications.filter(n => n.id !== notificationId);
      return;
    }

    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

export const getUserNotifications = (userId: string) => {
  if (isDemoMode) {
    return demoNotifications.filter(n => n.userId === userId);
  }
  return [];
};

// Helper functions for notification styling
const getNotificationToastType = (type: NotificationType) => {
  switch (type) {
    case 'challenge':
      return 'warning';
    case 'match':
      return 'info';
    case 'team_invite':
      return 'info';
    case 'follow':
      return 'success';
    case 'achievement':
      return 'success';
    case 'recommendation':
      return 'info';
    case 'news':
      return 'info';
    default:
      return 'default';
  }
};

const getNotificationIcon = (type: NotificationType) => {
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
};