import { useEffect, useState } from 'react';
import notificationService from '@/services/notification.service';
import type { Notification } from '@/types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getNotifications().then(setNotifications).finally(() => setLoading(false));
  }, []);

  return {
    notifications,
    loading,
    markAsRead: async (id: string) => {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
  };
};
