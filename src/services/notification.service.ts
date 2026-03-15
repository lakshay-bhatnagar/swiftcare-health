import core from './notificationService';
import { supabaseClient } from './supabaseClient';

const getUserId = async () => {
  const user = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const notificationService = {
  async getNotifications() { return core.getNotifications(await getUserId()); },
  async getUnreadCount() { return (await core.getNotifications(await getUserId())).filter((n) => !n.read).length; },
  async addNotification(payload: any) { return core.addNotification(await getUserId(), payload); },
  async markAsRead(id: string) { return core.markAsRead(id); },
  async markAllAsRead() { return core.markAllAsRead(await getUserId()); },
  async deleteNotification() {},
  async clearAll() {},
  createOrderNotification: async () => {},
  createPaymentNotification: async () => {},
  createConsultationNotification: async () => {},
};

export default notificationService;
