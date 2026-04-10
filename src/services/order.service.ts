import core from './orderService';
import type { CreateOrderParams } from './orderService';
import { supabase } from "../lib/supabase";

const getValidUserId = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("User not authenticated");
  return session.user.id;
};

// Helper for automatic retries on network failure
const withRetry = async (fn: () => Promise<any>, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      
      // LOG THE ACTUAL ERROR TO THE TERMINAL
      console.error(`DETAILED ERROR ATTEMPT ${i + 1}:`, JSON.stringify(err));

      // If it's a Supabase Error (PostgrestError), it's a DB issue, not a network issue.
      // We should NOT retry if it's a database constraint error.
      if (err.code || (err.status && err.status !== 0)) throw err;

      console.warn(`Retry attempt ${i + 1} due to suspected network failure...`);
      await new Promise(res => setTimeout(res, 1500 * (i + 1))); 
    }
  }
  throw lastError;
};

export const orderService = {
  async getOrders() {
    return core.getOrders(await getValidUserId());
  },
  async getOrderById(id: string) {
    const list = await core.getOrders(await getValidUserId());
    return list.find((o) => o.id === id);
  },
  async createOrder(params: Omit<CreateOrderParams, 'userId'> & { paymentStatus?: 'pending' | 'paid'; subtotal?: number; deliveryFee?: number; discount?: number; totalAmount?: number; couponCode?: string }) {
    const userId = await getValidUserId();
    // Wrap the core logic in the retry helper
    return await withRetry(async () => {
      const orders = await core.createOrder({ ...params, userId });
      if (!orders || orders.length === 0) throw new Error("Order creation returned no data");
      return orders[0];
    });
  },
  async updateOrderStatus(id: string, status: string) {
    return { id, status } as any;
  },
  async cancelOrder(_id: string) { },
  subscribeToOrderUpdates: core.subscribeToOrderUpdates,
};

export type { CreateOrderParams };
export default orderService;