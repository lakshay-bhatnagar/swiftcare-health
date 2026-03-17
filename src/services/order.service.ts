import core from './orderService';
import type { CreateOrderParams } from './orderService';
import { supabase } from "../lib/supabase";

const getValidUserId = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) throw new Error("User not authenticated");
  return session.user.id;
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
    const orders = await core.createOrder({ ...params, userId });
    return orders[0];
  },
  async updateOrderStatus(id: string, status: string) {
    return { id, status } as any;
  },
  async cancelOrder(_id: string) { },
  subscribeToOrderUpdates: core.subscribeToOrderUpdates,
};

export type { CreateOrderParams };
export default orderService;