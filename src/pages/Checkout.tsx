import React, { useState } from 'react';
import { Stripe, PaymentSheetEventsEnum } from '@capacitor-community/stripe';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Wallet, Banknote, Loader2, CheckCircle, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { AddressSelectorModal } from '@/components/address/AddressSelectorModal';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { couponService } from '@/services/coupon.service';
import { notificationService } from '@/services/notification.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Credit/Debit Card (Stripe)' },
  { id: 'upi', label: 'UPI', icon: Wallet, description: 'Pay via UPI apps' },
  { id: 'cod', label: 'Cash', icon: Banknote, description: 'Cash on Delivery' },
] as const;

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    getCartTotal,
    clearCart,
    addOrder,
    selectedAddress,
    appliedCoupon,
    applyCoupon: setAppliedCoupon,
    removeCoupon,
    addNotification,
    getUniquePharmacies,
  } = useApp();

  const [selectedPayment, setSelectedPayment] = useState<'card' | 'upi' | 'cod'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [orderNumber, setOrderNumber] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Delivery type (for multi-pharmacy orders)
  const uniquePharmacies = getUniquePharmacies();
  const isMultiPharmacy = uniquePharmacies.length > 1;
  const [deliveryType, setDeliveryType] = useState<'quick' | 'normal'>('quick');

  // Calculate totals
  const subtotal = getCartTotal();
  const deliveryFee = isMultiPharmacy && deliveryType === 'quick' ? 40 : 20;
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'percent'
      ? Math.min(
        (subtotal * appliedCoupon.value) / 100,
        appliedCoupon.maxDiscount || Infinity
      )
      : appliedCoupon.value
    : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const result = await couponService.applyCoupon(couponCode, subtotal);
      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        toast.success(`Coupon applied! You save ₹${result.discount}`);
        setCouponCode('');
      } else {
        toast.error(result.error || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      setShowAddressModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      let paymentStatus: 'pending' | 'paid' = 'pending';

      // Process payment based on method
      if (selectedPayment === 'card') {
        const { clientSecret } = await paymentService.createPaymentIntent(Math.round(total * 100));

        await Stripe.createPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'SwiftCare Health',
        });

        // This returns an object: { paymentResult: PaymentSheetEventsEnum }
        const result = await Stripe.presentPaymentSheet();

        // Compare using the Enum instead of a raw string
        if (result.paymentResult !== PaymentSheetEventsEnum.Completed) {
          toast.error('Payment not completed');
          setIsProcessing(false);
          return;
        }

        // --- ADD THIS DELAY ---
        // Gives the native bridge time to stabilize after the UI transition

        await new Promise(resolve => setTimeout(resolve, 800));

        paymentStatus = 'paid';
      }
      else if (selectedPayment === 'upi') {
        // Mock UPI - would open UPI app in real implementation
        const result = await paymentService.verifyUPIPayment('user@upi', total);
        if (!result.success) {
          toast.error(result.error || 'UPI payment failed');
          setIsProcessing(false);
          return;
        }
        paymentStatus = 'paid';
      }
      // COD remains 'pending'

      // Create order
      const order = await orderService.createOrder({
        items: cart,
        address: selectedAddress,
        paymentMethod: selectedPayment,
        paymentStatus,
        deliveryType,
        subtotal,
        deliveryFee,
        discount: Math.round(discount),
        totalAmount: Math.round(total),
        couponCode: appliedCoupon?.code,
      } as any);

      // Add to local state
      addOrder(order);

      // Create notification
      try {
        await addNotification({
          title: 'Order Confirmed! 🎉',
          message: `Your order #${order.orderNumber} has been confirmed. A pharmacist will call you shortly.`,
          type: 'order',
          data: { orderId: order.id },
        });
      } catch (e) {
        console.warn("Notification failed", e);
      }

      if (paymentStatus === 'paid') {
        try {
          await addNotification({
            title: 'Payment Successful 💳',
            message: `Payment of ₹${total} for order #${order.orderNumber} was successful.`,
            type: 'payment',
            data: { orderId: order.id },
          });
        } catch (e) {
          console.warn("Notification failed", e);
        }
      }

      setOrderId(order.id);
      setOrderNumber(order.orderNumber || order.id);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("ORDER ERROR:", error);
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
          className="w-24 h-24 rounded-full bg-success flex items-center justify-center mb-6"
        >
          <CheckCircle size={48} className="text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-2">
            Your order #{orderNumber} has been confirmed
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            A pharmacist will call you shortly to verify your order
          </p>
          <div className="swift-card mb-6 text-left">
            <p className="text-sm text-muted-foreground">Estimated Delivery</p>
            <p className="font-bold text-lg text-primary">
              {deliveryType === 'quick' ? '10-15 minutes' : '25-35 minutes'}
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate(`/order/${orderId}`)} className="w-full">
              View Order Details
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
    <div className="min-h-screen bg-background safe-top safe-bottom pb-32">
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
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-sm text-primary font-medium"
                >
                  {selectedAddress ? 'Change' : 'Add'}
                </button>
              </div>
              {selectedAddress ? (
                <div className="mt-1">
                  <p className="text-sm font-medium">{selectedAddress.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress.full_name} • {selectedAddress.phone_number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                    , {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-destructive mt-1">
                  Please add a delivery address
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Pharmacy Delivery Option */}
        {isMultiPharmacy && (
          <div className="swift-card">
            <h3 className="font-semibold mb-3">Delivery Option</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Your cart has items from {uniquePharmacies.length} different pharmacies
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setDeliveryType('quick')}
                className={cn(
                  "w-full p-3 rounded-xl border-2 text-left transition-all",
                  deliveryType === 'quick'
                    ? "border-primary bg-primary-light"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quick Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Separate delivery partners • 10-15 mins
                    </p>
                  </div>
                  <span className="font-semibold text-primary">₹40</span>
                </div>
              </button>
              <button
                onClick={() => setDeliveryType('normal')}
                className={cn(
                  "w-full p-3 rounded-xl border-2 text-left transition-all",
                  deliveryType === 'normal'
                    ? "border-primary bg-primary-light"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Normal Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Single consolidated route • 25-35 mins
                    </p>
                  </div>
                  <span className="font-semibold text-primary">₹20</span>
                </div>
              </button>
            </div>
          </div>
        )}

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

        {/* Coupon */}
        <div className="swift-card">
          <h3 className="font-semibold mb-3">Apply Coupon</h3>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-success-light">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-success" />
                <div>
                  <p className="font-medium text-success">{appliedCoupon.code}</p>
                  <p className="text-xs text-success/80">You save ₹{Math.round(discount)}</p>
                </div>
              </div>
              <button onClick={removeCoupon} className="p-1.5 hover:bg-success/20 rounded-lg">
                <X size={18} className="text-success" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1"
              />
              <Button
                onClick={handleApplyCoupon}
                variant="outline"
                disabled={isApplyingCoupon || !couponCode.trim()}
              >
                {isApplyingCoupon ? <Loader2 className="animate-spin" size={18} /> : 'Apply'}
              </Button>
            </div>
          )}
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
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-₹{Math.round(discount)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-primary">₹{Math.round(total)}</span>
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
            disabled={isProcessing || cart.length === 0}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              `Place Order • ₹${Math.round(total)}`
            )}
          </Button>
        </div>
      </div>

      {/* Address Selector Modal */}
      <AddressSelectorModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />
    </div>
  );
};

export default Checkout;
