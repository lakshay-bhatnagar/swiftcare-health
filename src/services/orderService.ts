import type { Address, CartItem, Order } from '@/types';
import { supabaseClient } from './supabaseClient';

export interface CreateOrderParams {
  userId: string;
  items: CartItem[];
  address: Address;
  paymentMethod: 'stripe' | 'upi' | 'cod';
  deliveryType: 'quick' | 'normal';
}

const groupByPharmacy = (items: CartItem[]) => {
  const map = new Map<string, CartItem[]>();
  items.forEach((item) => {
    const key = item.medicine.pharmacyId;
    const list = map.get(key) || [];
    list.push(item);
    map.set(key, list);
  });
  return map;
};

export const orderService = {
  async getOrders(userId: string): Promise<Order[]> {
    const rows = await supabaseClient
      .from('orders')
      .query<any[]>(`select=*,pharmacies(name),addresses(*),order_items(*)&user_id=eq.${userId}&order=created_at.desc`);

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      items: (row.order_items || []).map((i: any) => ({ quantity: i.quantity, medicine: { id: i.medicine_id, name: i.medicine_name, genericName: i.medicine_name, category: '', price: i.unit_price, mrp: i.unit_price, discount: 0, image: '/placeholder.svg', description: '', dosage: '', manufacturer: '', prescriptionRequired: false, inStock: true, pharmacyId: row.pharmacy_id, pharmacyName: row.pharmacies?.name || '' } })),
      pharmacyIds: [row.pharmacy_id],
      totalAmount: Number(row.total),
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      discount: 0,
      deliveryType: Number(row.delivery_fee) > 0 ? 'quick' : 'normal',
      paymentMethod: row.payment_method,
      paymentStatus: 'paid',
      address: { id: row.addresses?.id ?? '', label: row.addresses?.label ?? 'Home', name: '', phone: '', addressLine1: row.addresses?.address_line1 ?? '', addressLine2: row.addresses?.address_line2 ?? '', city: row.addresses?.city ?? '', state: row.addresses?.state ?? '', pincode: row.addresses?.postal_code ?? '', isDefault: !!row.addresses?.is_default },
      status: row.status,
      createdAt: new Date(row.created_at),
      estimatedDelivery: row.delivery_fee > 0 ? '10-15 mins' : '25-35 mins',
      pharmacy: { id: row.pharmacy_id, name: row.pharmacies?.name ?? '', address: '', distance: '', deliveryTime: '', rating: 4.5, reviewCount: 0, image: '/placeholder.svg', isOpen: true },
      couponCode: undefined,
    }));
  },

  async createOrder(params: CreateOrderParams): Promise<Order[]> {
    const grouped = groupByPharmacy(params.items);
    const created: Order[] = [];

    for (const [pharmacyId, items] of grouped.entries()) {
      const subtotal = items.reduce((sum, i) => sum + i.medicine.price * i.quantity, 0);
      const deliveryFee = params.deliveryType === 'quick' ? 49 : 0;
      const [orderRow] = await supabaseClient.from('orders').insert<any[]>([{ user_id: params.userId, pharmacy_id: pharmacyId, address_id: params.address.id, subtotal, delivery_fee: deliveryFee, total: subtotal + deliveryFee, payment_method: params.paymentMethod, status: 'pending' }]);

      await supabaseClient.from('order_items').insert(
        items.map((item) => ({
          order_id: orderRow.id,
          medicine_id: item.medicine.id,
          medicine_name: item.medicine.name,
          quantity: item.quantity,
          unit_price: item.medicine.price,
          total_price: item.quantity * item.medicine.price,
        }))
      );

      created.push(...(await this.getOrders(params.userId)).filter((o) => o.id === orderRow.id));
    }

    return created;
  },

  subscribeToOrderUpdates(cb: (orderId: string, status: string) => void) {
    const interval = window.setInterval(async () => {
      // Fallback polling when SDK realtime is unavailable.
      const user = await supabaseClient.auth.getUser();
      if (!user) return;
      const rows = await supabaseClient.from('orders').query<any[]>(`select=id,status&user_id=eq.${user.id}&order=updated_at.desc&limit=20`);
      rows.forEach((r) => cb(r.id, r.status));
    }, 10000);

    return () => window.clearInterval(interval);
  },
};

export default orderService;
