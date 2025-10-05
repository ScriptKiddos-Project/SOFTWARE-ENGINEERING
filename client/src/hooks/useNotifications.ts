// client/src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications for now - replace with actual API call
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      // TODO: Replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Event Registration Confirmed',
          message: 'You have successfully registered for Tech Workshop',
          type: 'success',
          read: false,
          createdAt: new Date().toISOString(),
          link: '/events/1',
        },
        {
          id: '2',
          title: 'New Event Available',
          message: 'Check out the new Sports Tournament event',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          link: '/events/2',
        },
      ];
      return { data: mockNotifications };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = notificationsData?.data || [];

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // TODO: Replace with actual API call
      console.log('Marking notification as read:', notificationId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // TODO: Replace with actual API call
      console.log('Marking all notifications as read');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await markAsReadMutation.mutateAsync(notificationId);
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const clearNotification = useCallback(
    async (notificationId: string) => {
      // TODO: Implement delete notification API call
      console.log('Clearing notification:', notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [queryClient]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    error: error as Error | null,
    refetch,
    markAsRead,
    markAllAsRead,
    clearNotification,
  };
};