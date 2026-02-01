import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, AlertTriangle, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart, getCartTotal, clearCart } = useApp();
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'quick' | 'normal' | null>(null);

  // Group cart items by pharmacy
  const itemsByPharmacy = cart.reduce((acc, item) => {
    const pharmacyId = item.medicine.pharmacyId;
    if (!acc[pharmacyId]) {
      acc[pharmacyId] = {
        pharmacyName: item.medicine.pharmacyName,
        items: [],
      };
    }
    acc[pharmacyId].items.push(item);
    return acc;
  }, {} as Record<string, { pharmacyName: string; items: typeof cart }>);

  const pharmacyCount = Object.keys(itemsByPharmacy).length;
  const hasMultiplePharmacies = pharmacyCount > 1;

  const subtotal = getCartTotal();
  const deliveryFee = hasMultiplePharmacies && deliveryOption === 'quick' ? 40 : 20;
  const total = subtotal + deliveryFee;

  const handleProceedToCheckout = () => {
    if (hasMultiplePharmacies && !deliveryOption) {
      setShowDeliveryModal(true);
    } else {
      navigate('/checkout');
    }
  };

  const handleSelectDeliveryOption = (option: 'quick' | 'normal') => {
    setDeliveryOption(option);
    setShowDeliveryModal(false);
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <MobileLayout>
        <div className="safe-top flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add medicines to your cart and they will appear here
          </p>
          <Button onClick={() => navigate('/browse')}>Browse Medicines</Button>
        </div>
      </MobileLayout>
    );
  }

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
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Your Cart</h1>
            <p className="text-sm text-muted-foreground">
              {cart.length} items from {pharmacyCount} pharmacy
              {pharmacyCount > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-destructive font-medium"
          >
            Clear
          </button>
        </div>

        {/* Multi-Pharmacy Warning */}
        {hasMultiplePharmacies && (
          <div className="mx-4 mt-4 swift-card bg-warning-light border-warning/30 flex gap-3">
            <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-warning">
                Items from multiple pharmacies
              </p>
              <p className="text-xs text-warning/80 mt-0.5">
                You can choose quick or normal delivery at checkout
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="px-4 py-4 space-y-4">
          <AnimatePresence>
            {Object.entries(itemsByPharmacy).map(([pharmacyId, { pharmacyName, items }]) => (
              <motion.div
                key={pharmacyId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {pharmacyName}
                </h3>
                {items.map((item) => (
                  <motion.div
                    key={item.medicine.id}
                    layout
                    className="swift-card flex gap-3"
                  >
                    <img
                      src={item.medicine.image}
                      alt={item.medicine.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {item.medicine.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        ₹{item.medicine.price} × {item.quantity}
                      </p>
                      <p className="font-bold text-primary mt-1">
                        ₹{item.medicine.price * item.quantity}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.medicine.id)}
                        className="p-1.5 text-destructive hover:bg-destructive-light rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-0.5 bg-muted rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.medicine.id, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-muted-foreground/10"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.medicine.id, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-muted-foreground/10"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Price Summary */}
        <div className="px-4 pb-4">
          <div className="swift-card space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
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
        <div className="px-4 pb-6">
          <Button
            onClick={handleProceedToCheckout}
            size="xl"
            className="w-full"
          >
            Proceed to Checkout • ₹{total}
          </Button>
        </div>

        {/* Multi-Pharmacy Delivery Modal */}
        <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>Choose Delivery Option</DialogTitle>
              <DialogDescription>
                You have items from multiple pharmacies. How would you like them
                delivered?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <button
                onClick={() => handleSelectDeliveryOption('quick')}
                className="swift-card-hover w-full text-left flex gap-4 items-center border-2 border-primary"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                  <Zap size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Quick Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Separate delivery partners • +₹20
                  </p>
                  <p className="text-xs text-primary mt-1">10-15 mins each</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectDeliveryOption('normal')}
                className="swift-card-hover w-full text-left flex gap-4 items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Clock size={24} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Normal Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Single delivery route • No extra cost
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">25-35 mins</p>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
};

export default Cart;
