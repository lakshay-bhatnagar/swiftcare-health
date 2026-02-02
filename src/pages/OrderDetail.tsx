import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Order } from '@/types';

const statusSteps = [
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'packed', label: 'Packed', icon: Package },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export const OrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { orders } = useApp();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const foundOrder = orders.find(o => o.id === id);
    setOrder(foundOrder || null);
  }, [id, orders]);

  if (!order) {
    return (
      <MobileLayout showNav={false}>
        <div className="safe-top flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <p className="text-muted-foreground">Order not found</p>
          <button onClick={() => navigate('/orders')} className="text-primary mt-4">
            View all orders
          </button>
        </div>
      </MobileLayout>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.status === order.status);

  return (
    <MobileLayout showNav={false}>
      <div className="safe-top pb-6">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Order Details</h1>
            <p className="text-xs text-muted-foreground">{order.id}</p>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Order Status Timeline */}
          <div className="swift-card">
            <h3 className="font-semibold mb-4">Order Status</h3>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex items-start gap-3 relative">
                    {/* Line */}
                    {index < statusSteps.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-[19px] top-10 w-0.5 h-8",
                          isCompleted ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Label */}
                    <div className={cn("pb-8", index === statusSteps.length - 1 && "pb-0")}>
                      <p
                        className={cn(
                          "font-medium",
                          isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      {isCurrent && order.status !== 'delivered' && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Estimated: {order.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pharmacy Info */}
          <div className="swift-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pharmacy</p>
                <p className="font-semibold">{order.pharmacy.name}</p>
              </div>
              <button className="p-2 bg-primary-light rounded-full">
                <Phone size={18} className="text-primary" />
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="swift-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">Delivery Address</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.address.name} • {order.address.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.address.addressLine1}
                  {order.address.addressLine2 && `, ${order.address.addressLine2}`}
                  <br />
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="swift-card">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.medicine.id} className="flex gap-3">
                  <img
                    src={item.medicine.image}
                    alt={item.medicine.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.medicine.name}</p>
                    <p className="text-xs text-muted-foreground">{item.medicine.manufacturer}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-medium text-sm">₹{item.medicine.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="swift-card">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">₹{order.totalAmount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
              <CreditCard size={16} />
              <span className="capitalize">{order.paymentMethod}</span>
              <span className={cn(
                "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                order.paymentStatus === 'paid' 
                  ? "bg-success-light text-success"
                  : "bg-warning-light text-warning"
              )}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Order Info */}
          <div className="swift-card">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Time</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Delivery Type</p>
                <p className="font-medium capitalize">{order.deliveryType}</p>
              </div>
              {order.couponCode && (
                <div>
                  <p className="text-muted-foreground">Coupon Applied</p>
                  <p className="font-medium text-primary">{order.couponCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Need Help */}
          <Button variant="outline" className="w-full">
            Need Help with this Order?
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default OrderDetail;
