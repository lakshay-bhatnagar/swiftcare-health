import core from './notificationService';
import { supabase } from "../lib/supabase"; // Use your standard client

const getValidUserId = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("User not authenticated");
  return session.user.id;
};

export const notificationService = {
  async getNotifications() { 
    return core.getNotifications(await getValidUserId()); 
  },
  async getUnreadCount() { 
    const notifications = await core.getNotifications(await getValidUserId());
    return notifications.filter((n) => !n.read).length; 
  },
  async addNotification(payload: any) { 
    return core.addNotification(await getValidUserId(), payload); 
  },
  async markAsRead(id: string) { 
    return core.markAsRead(id); 
  },
  async markAllAsRead() { 
    return core.markAllAsRead(await getValidUserId()); 
  },
  async deleteNotification() { },
  async clearAll() { },
  createOrderNotification: async () => { },
  createPaymentNotification: async () => { },
  createConsultationNotification: async () => { },
};

export default notificationService;