import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, CreditCard, Stethoscope, FileText, Tag, Settings, Trash2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  order: Package,
  payment: CreditCard,
  consultation: Stethoscope,
  prescription: FileText,
  promo: Tag,
  system: Settings,
};

const typeColors = {
  order: 'bg-primary-light text-primary',
  payment: 'bg-success-light text-success',
  consultation: 'bg-accent-light text-accent',
  prescription: 'bg-warning-light text-warning',
  promo: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  system: 'bg-muted text-muted-foreground',
};

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loadNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications 
  } = useApp();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = async (id: string, data?: Record<string, any>) => {
    await markNotificationAsRead(id);
    
    // Navigate based on notification type
    if (data?.orderId) {
      navigate('/orders');
    }
  };

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="text-lg font-semibold">Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={20} className="text-primary" />
              </button>
              <button
                onClick={clearNotifications}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
                title="Clear all"
              >
                <Trash2 size={20} className="text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        <div className="px-4 py-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-2">No notifications</h2>
              <p className="text-muted-foreground">
                You're all caught up! Check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const Icon = typeIcons[notification.type] || Bell;
                  const colorClass = typeColors[notification.type] || typeColors.system;
                  
                  return (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification.id, notification.data)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all",
                        notification.read 
                          ? "bg-card" 
                          : "bg-primary/5 border-l-4 border-primary"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={cn(
                              "font-medium line-clamp-1",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Notifications;
