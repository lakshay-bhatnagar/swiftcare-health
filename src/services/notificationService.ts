import type { Notification } from '@/types';
import { supabase } from "../lib/supabase"; // Use the standard SDK instance

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
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching notifications:", error.message);
      throw error;
    }

    return (data || []).map(mapNotification);
  },

  async addNotification(userId: string, payload: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          is_read: false,
          data: payload.data ?? null,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error adding notification:", error.message);
      throw error;
    }
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Listens for new notifications in real-time instead of polling.
   */
  subscribeToNotifications(userId: string, cb: () => void) {
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}` 
        },
        () => {
          cb();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export default notificationService;