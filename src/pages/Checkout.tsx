import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Wallet, Banknote, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Wallet, description: 'Pay via UPI apps' },
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Credit/Debit Card' },
  { id: 'cod', label: 'Cash', icon: Banknote, description: 'Cash on Delivery' },
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, cart, getCartTotal, clearCart, addOrder } = useApp();
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const subtotal = getCartTotal();
  const deliveryFee = 20;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user?.address?.line1) {
      toast.error('Please add a delivery address');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await api.placeOrder({
        items: cart,
        totalAmount: total,
        deliveryAddress: user.address,
        paymentMethod: selectedPayment,
      });

      addOrder(order);
      setOrderId(order.id);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background safe-top safe-bottom flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full gradient-success flex items-center justify-center mb-6"
        >
          <CheckCircle size={48} className="text-success-foreground" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-2">
            Your order #{orderId} has been confirmed
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            A pharmacist will call you shortly to verify your order
          </p>
          <div className="swift-card mb-6 text-left">
            <p className="text-sm text-muted-foreground">Estimated Delivery</p>
            <p className="font-bold text-lg text-primary">10-15 minutes</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate('/orders')} className="w-full">
              Track Order
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold">Checkout</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Delivery Address */}
        <div className="swift-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Delivery Address</h3>
                <button className="text-sm text-primary font-medium">Change</button>
              </div>
              {user?.address?.line1 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.address.line1}
                  {user.address.line2 && `, ${user.address.line2}`}
                  <br />
                  {user.address.city}, {user.address.state} {user.address.pincode}
                </p>
              ) : (
                <p className="text-sm text-destructive mt-1">
                  Please add a delivery address
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="swift-card">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.medicine.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.medicine.name} × {item.quantity}
                </span>
                <span>₹{item.medicine.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="swift-card">
          <h3 className="font-semibold mb-3">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPayment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon
                    size={20}
                    className={isSelected ? "text-primary" : "text-muted-foreground"}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{method.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected ? "border-primary" : "border-muted-foreground/30"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Summary */}
        <div className="swift-card">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-primary">₹{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 safe-bottom">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handlePlaceOrder}
            size="xl"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              `Place Order • ₹${total}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
