import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const statusConfig = {
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-primary' },
  packed: { label: 'Packed', icon: Package, color: 'text-accent' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-warning' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-success' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-destructive' },
};

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loadOrders } = useApp();

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold">Order History</h1>
        </div>

        <div className="px-4 py-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const status =
                  statusConfig[order.status as keyof typeof statusConfig] ||
                  statusConfig.confirmed;

                const StatusIcon = status.icon;

                return (
                  <motion.button
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="swift-card w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          status.color
                        )}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {order.items.slice(0, 3).map((item) => (
                        <img
                          key={item.medicine.id}
                          src={item.medicine.image}
                          alt={item.medicine.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-primary">
                          ₹{order.totalAmount}
                        </p>
                      </div>
                      <span className="text-sm text-primary font-medium">
                        View Details →
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Orders;
