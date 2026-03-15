import core from './orderService';
import type { CreateOrderParams } from './orderService';
import { supabaseClient } from './supabaseClient';

const getUserId = async () => {
  const user = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

export const orderService = {
  async getOrders() {
    return core.getOrders(await getUserId());
  },
  async getOrderById(id: string) {
    const list = await core.getOrders(await getUserId());
    return list.find((o) => o.id === id);
  },
  async createOrder(params: Omit<CreateOrderParams, 'userId'> & { paymentStatus?: 'pending' | 'paid'; subtotal?: number; deliveryFee?: number; discount?: number; totalAmount?: number; couponCode?: string }) {
    const orders = await core.createOrder({ ...params, userId: await getUserId() });
    return orders[0];
  },
  async updateOrderStatus(id: string, status: string) {
    return { id, status } as any;
  },
  async cancelOrder(_id: string) {},
  subscribeToOrderUpdates: core.subscribeToOrderUpdates,
};

export type { CreateOrderParams };
export default orderService;
