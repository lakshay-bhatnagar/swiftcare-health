import { Notification } from '@/types';

const STORAGE_KEY = 'swiftcare_notifications';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get notifications from localStorage
const getStoredNotifications = (): Notification[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((n: any) => ({
    ...n,
    createdAt: new Date(n.createdAt),
  }));
};

// Save notifications to localStorage
const saveNotifications = (notifications: Notification[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

export const notificationService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    await delay(300);
    return getStoredNotifications().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    await delay(100);
    const notifications = getStoredNotifications();
    return notifications.filter(n => !n.read).length;
  },

  // Add notification
  addNotification: async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
    await delay(200);
    const notifications = getStoredNotifications();
    
    const newNotification: Notification = {
      ...notification,
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date(),
    };
    
    notifications.unshift(newNotification);
    saveNotifications(notifications);
    return newNotification;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const notifications = getStoredNotifications();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      saveNotifications(notifications);
    }
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await delay(300);
    const notifications = getStoredNotifications();
    notifications.forEach(n => n.read = true);
    saveNotifications(notifications);
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await delay(200);
    let notifications = getStoredNotifications();
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications(notifications);
  },

  // Clear all notifications
  clearAll: async (): Promise<void> => {
    await delay(300);
    saveNotifications([]);
  },

  // Create order notification
  createOrderNotification: async (orderId: string, status: string): Promise<void> => {
    const messages: Record<string, { title: string; message: string }> = {
      confirmed: {
        title: 'Order Confirmed! 🎉',
        message: `Your order #${orderId} has been confirmed. A pharmacist will call you shortly.`,
      },
      packed: {
        title: 'Order Packed 📦',
        message: `Your order #${orderId} has been packed and is ready for pickup.`,
      },
      out_for_delivery: {
        title: 'Out for Delivery 🚗',
        message: `Your order #${orderId} is on its way! Track your delivery in real-time.`,
      },
      delivered: {
        title: 'Order Delivered ✅',
        message: `Your order #${orderId} has been delivered. Thank you for using SwiftCare!`,
      },
    };
    
    const msg = messages[status];
    if (msg) {
      await notificationService.addNotification({
        title: msg.title,
        message: msg.message,
        type: 'order',
        data: { orderId, status },
      });
    }
  },

  // Create payment notification
  createPaymentNotification: async (orderId: string, success: boolean): Promise<void> => {
    await notificationService.addNotification({
      title: success ? 'Payment Successful 💳' : 'Payment Failed ❌',
      message: success 
        ? `Payment for order #${orderId} was successful.`
        : `Payment for order #${orderId} failed. Please try again.`,
      type: 'payment',
      data: { orderId, success },
    });
  },

  // Create consultation notification
  createConsultationNotification: async (doctorName: string, time: string): Promise<void> => {
    await notificationService.addNotification({
      title: 'Consultation Booked 👨‍⚕️',
      message: `Your consultation with ${doctorName} is scheduled for ${time}.`,
      type: 'consultation',
    });
  },
};

export default notificationService;
