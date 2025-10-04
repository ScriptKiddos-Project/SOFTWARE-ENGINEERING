import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'club' | 'achievement' | 'system';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    addNotification: (notificationData) => {
      const newNotification: Notification = {
        ...notificationData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        read: false,
      };

      set((state) => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));

      // Show toast notification
      toast.success(notificationData.title, {
        duration: 4000,
      });
    },

    markAsRead: (notificationId) => {
      set((state) => {
        const notifications = state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        );
        
        const unreadCount = notifications.filter(n => !n.read).length;
        
        return {
          notifications,
          unreadCount,
        };
      });
    },

    markAllAsRead: () => {
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
        unreadCount: 0,
      }));
    },

    clearNotification: (notificationId) => {
      set((state) => {
        const notifications = state.notifications.filter(
          (notification) => notification.id !== notificationId
        );
        const unreadCount = notifications.filter(n => !n.read).length;
        
        return {
          notifications,
          unreadCount,
        };
      });
    },

    clearAllNotifications: () => {
      set({
        notifications: [],
        unreadCount: 0,
      });
    },

    fetchNotifications: async () => {
      set({ isLoading: true });
      
      try {
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'New Event: Tech Workshop',
            message: 'A new tech workshop has been scheduled for next week. Register now!',
            type: 'event',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            actionUrl: '/events/1',
          },
          {
            id: '2',
            title: 'Welcome to Computer Science Club!',
            message: 'Your request to join the Computer Science Club has been approved.',
            type: 'club',
            read: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            actionUrl: '/clubs/cs-club',
          },
          {
            id: '3',
            title: 'Achievement Unlocked!',
            message: 'Congratulations! You earned the "Event Enthusiast" badge.',
            type: 'achievement',
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            actionUrl: '/profile?tab=badges',
          },
          {
            id: '4',
            title: 'System Maintenance',
            message: 'Scheduled maintenance will occur tonight from 2-4 AM EST.',
            type: 'system',
            read: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          },
        ];
        
        set({
          notifications: mockNotifications,
          unreadCount: mockNotifications.filter(n => !n.read).length,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        toast.error('Failed to load notifications');
        set({ isLoading: false });
      }
    },

    setNotifications: (notifications) => {
      const unreadCount = notifications.filter(n => !n.read).length;
      set({
        notifications,
        unreadCount,
      });
    },
  }))
);

// Subscribe to notification changes to update browser notifications
useNotificationStore.subscribe(
  (state) => state.notifications,
  (notifications, previousNotifications) => {
    // Check if we have permission for browser notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Find new notifications
      const newNotifications = notifications.filter(
        (notification) => 
          !previousNotifications.some(prev => prev.id === notification.id) &&
          !notification.read
      );

      // Show browser notification for new notifications
      newNotifications.forEach((notification) => {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: notification.id,
          });
        }
      });
    }
  }
);

// Utility functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const getNotificationTypeColor = (type: Notification['type']): string => {
  switch (type) {
    case 'event':
      return 'text-blue-600 bg-blue-50';
    case 'club':
      return 'text-green-600 bg-green-50';
    case 'achievement':
      return 'text-yellow-600 bg-yellow-50';
    case 'system':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const createNotificationFromEvent = (eventTitle: string, eventId: string) => {
  const { addNotification } = useNotificationStore.getState();
  addNotification({
    title: `Event Reminder: ${eventTitle}`,
    message: `Your registered event "${eventTitle}" starts in 30 minutes!`,
    type: 'event',
    actionUrl: `/events/${eventId}`,
  });
};

export const createNotificationFromClubJoin = (clubName: string, clubId: string) => {
  const { addNotification } = useNotificationStore.getState();
  addNotification({
    title: `Welcome to ${clubName}!`,
    message: `Your request to join ${clubName} has been approved.`,
    type: 'club',
    actionUrl: `/clubs/${clubId}`,
  });
};

export const createAchievementNotification = (badgeName: string, description: string) => {
  const { addNotification } = useNotificationStore.getState();
  addNotification({
    title: 'Achievement Unlocked!',
    message: `Congratulations! You earned the "${badgeName}" badge. ${description}`,
    type: 'achievement',
    actionUrl: '/profile?tab=badges',
  });
};