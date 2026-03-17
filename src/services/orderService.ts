import type { Address, CartItem, Order } from '@/types';
import { supabase } from "../lib/supabase"; // Ensure this points to your standard Supabase client

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
    const { data: rows, error } = await supabase
      .from('orders')
      .select(`
        *,
        pharmacies(name),
        addresses(*),
        order_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message);
      throw error;
    }

    return (rows || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      items: (row.order_items || []).map((i: any) => ({
        quantity: i.quantity,
        medicine: {
          id: i.medicine_id,
          name: i.medicine_name,
          genericName: i.medicine_name,
          category: '',
          price: i.unit_price,
          mrp: i.unit_price,
          discount: 0,
          image: '/placeholder.svg',
          description: '',
          dosage: '',
          manufacturer: '',
          prescriptionRequired: false,
          inStock: true,
          pharmacyId: row.pharmacy_id,
          pharmacyName: row.pharmacies?.name || ''
        }
      })),
      pharmacyIds: [row.pharmacy_id],
      totalAmount: Number(row.total),
      subtotal: Number(row.subtotal),
      deliveryFee: Number(row.delivery_fee),
      discount: 0,
      deliveryType: Number(row.delivery_fee) > 0 ? 'quick' : 'normal',
      paymentMethod: row.payment_method,
      paymentStatus: 'paid',
      address: {
        id: row.addresses?.id ?? '',
        label: row.addresses?.label ?? 'Home',
        name: '',
        phone: '',
        addressLine1: row.addresses?.address_line1 ?? '',
        addressLine2: row.addresses?.address_line2 ?? '',
        city: row.addresses?.city ?? '',
        state: row.addresses?.state ?? '',
        pincode: row.addresses?.postal_code ?? '',
        isDefault: !!row.addresses?.is_default
      },
      status: row.status,
      createdAt: new Date(row.created_at),
      estimatedDelivery: row.delivery_fee > 0 ? '10-15 mins' : '25-35 mins',
      pharmacy: {
        id: row.pharmacy_id,
        name: row.pharmacies?.name ?? '',
        address: '',
        distance: '',
        deliveryTime: '',
        rating: 4.5,
        reviewCount: 0,
        image: '/placeholder.svg',
        isOpen: true
      },
      couponCode: undefined,
    }));
  },

  async createOrder(params: CreateOrderParams): Promise<Order[]> {
    const grouped = groupByPharmacy(params.items);
    const createdOrders: Order[] = [];

    for (const [pharmacyId, items] of grouped.entries()) {
      const subtotal = items.reduce((sum, i) => sum + i.medicine.price * i.quantity, 0);
      const deliveryFee = params.deliveryType === 'quick' ? 49 : 0;

      // 1. Insert the Order
      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: params.userId,
          pharmacy_id: pharmacyId,
          address_id: params.address.id,
          subtotal,
          delivery_fee: deliveryFee,
          total: subtotal + deliveryFee,
          payment_method: params.paymentMethod,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          items.map((item) => ({
            order_id: orderRow.id,
            medicine_id: item.medicine.id,
            medicine_name: item.medicine.name,
            quantity: item.quantity,
            unit_price: item.medicine.price,
            total_price: item.quantity * item.medicine.price,
          }))
        );

      if (itemsError) throw itemsError;

      // 3. Fetch the full order object to return to UI
      const fullOrders = await this.getOrders(params.userId);
      const matched = fullOrders.find(o => o.id === orderRow.id);
      if (matched) createdOrders.push(matched);
    }

    return createdOrders;
  },

  subscribeToOrderUpdates(cb: (orderId: string, status: string) => void) {
    // Real-time implementation using Supabase Channels
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          cb(payload.new.id, payload.new.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export default orderService;