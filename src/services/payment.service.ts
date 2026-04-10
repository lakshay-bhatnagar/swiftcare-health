// Mock Payment Service for Stripe Demo Integration
// In production, this would integrate with actual Stripe APIs via edge functions

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  clientSecret?: string;
  paymentMethod?: string;
  createdAt: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

// Mock payment intents storage
const STORAGE_KEY = 'swiftcare_payments';

const getStoredPayments = (): PaymentIntent[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored).map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
  }));
};

const savePayments = (payments: PaymentIntent[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
};

export const paymentService = {
  // Create payment intent (mock Stripe)
  createPaymentIntent: async (amount: number): Promise<{ clientSecret: string }> => {
    // Replace with your actual project URL from Supabase Dashboard
    const PROJECT_ID = 'yenfvedvyzgqejytgolp'; 
    const URL = `https://${PROJECT_ID}.functions.supabase.co/create-payment-intent`;
    
    // Use your Anon Key (find in Settings > API)
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbmZ2ZWR2eXpncWVqeXRnb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTk1NjksImV4cCI6MjA4ODM3NTU2OX0.zaVYqv1LeKm2_n7cjBNLdGoDMWAV6RWqVLnPfdOrTfI';

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment intent');
    }

    return await response.json(); // Should return { clientSecret: 'pi_...' }
  },

  // Process payment (mock - simulates success/failure)
  processPayment: async (
    paymentIntentId: string, 
    paymentMethod: 'card' | 'upi'
  ): Promise<PaymentResult> => {
    await delay(2000); // Simulate processing time
    
    const payments = getStoredPayments();
    const payment = payments.find(p => p.id === paymentIntentId);
    
    if (!payment) {
      return { success: false, error: 'Payment intent not found' };
    }
    
    // 90% success rate for demo
    const isSuccess = Math.random() > 0.1;
    
    payment.status = isSuccess ? 'succeeded' : 'failed';
    payment.paymentMethod = paymentMethod;
    savePayments(payments);
    
    if (isSuccess) {
      return { success: true, paymentIntentId };
    } else {
      return { success: false, error: 'Payment failed. Please try again.' };
    }
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<PaymentIntent | undefined> => {
    await delay(300);
    const payments = getStoredPayments();
    return payments.find(p => p.id === id);
  },

  // Confirm COD payment
  confirmCODPayment: async (orderId: string): Promise<PaymentResult> => {
    await delay(500);
    // COD is always "successful" as a pending payment
    return { success: true, paymentIntentId: 'cod_' + orderId };
  },

  // Verify UPI payment (mock)
  verifyUPIPayment: async (upiId: string, amount: number): Promise<PaymentResult> => {
    await delay(1500);
    
    // Validate UPI ID format
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId)) {
      return { success: false, error: 'Invalid UPI ID format' };
    }
    
    // 95% success rate for UPI
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      return { 
        success: true, 
        paymentIntentId: 'upi_' + Date.now() 
      };
    } else {
      return { success: false, error: 'UPI payment failed. Please try again.' };
    }
  },

  // Refund payment (mock)
  refundPayment: async (paymentIntentId: string): Promise<PaymentResult> => {
    await delay(1000);
    
    const payments = getStoredPayments();
    const payment = payments.find(p => p.id === paymentIntentId);
    
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }
    
    if (payment.status !== 'succeeded') {
      return { success: false, error: 'Cannot refund this payment' };
    }
    
    payment.status = 'cancelled';
    savePayments(payments);
    
    return { success: true, paymentIntentId };
  },
};

export default paymentService;
