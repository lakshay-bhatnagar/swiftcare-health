import type { Notification } from '@/types';
import { supabaseClient } from './supabaseClient';

const mapNotification = (n: any): Notification => ({
  id: n.id,
  title: n.title,
  message: n.message,
  type: n.type,
  read: !!n.is_read,
  createdAt: new Date(n.created_at),
  data: n.data ?? undefined,
});

export const notificationService = {
  async getNotifications(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
    const rows = await supabaseClient
      .from('notifications')
      .query<any[]>(`select=*&user_id=eq.${userId}&order=created_at.desc&limit=${limit}&offset=${offset}`);
    return rows.map(mapNotification);
  },

  async addNotification(userId: string, payload: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    await supabaseClient.from('notifications').insert([{ user_id: userId, title: payload.title, message: payload.message, type: payload.type, is_read: false, data: payload.data ?? null }]);
  },

  async markAsRead(id: string) {
    await supabaseClient.from('notifications').update(`id=eq.${id}`, { is_read: true });
  },

  async markAllAsRead(userId: string) {
    await supabaseClient.from('notifications').update(`user_id=eq.${userId}`, { is_read: true });
  },

  subscribeToNotifications(userId: string, cb: () => void) {
    const interval = window.setInterval(async () => {
      const rows = await supabaseClient.from('notifications').query<any[]>(`select=id&user_id=eq.${userId}&order=created_at.desc&limit=1`);
      if (rows.length) cb();
    }, 10000);

    return () => window.clearInterval(interval);
  },
};

export default notificationService;
