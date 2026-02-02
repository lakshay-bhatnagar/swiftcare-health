import { Order, CartItem, Address, Pharmacy } from '@/types';
import { mockPharmacies } from './api';

const STORAGE_KEY = 'swiftcare_orders';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get orders from localStorage
const getStoredOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  const orders = JSON.parse(stored);
  // Convert date strings back to Date objects
  return orders.map((o: any) => ({
    ...o,
    createdAt: new Date(o.createdAt),
  }));
};

// Save orders to localStorage
const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export interface CreateOrderParams {
  items: CartItem[];
  address: Address;
  paymentMethod: 'stripe' | 'upi' | 'cod';
  paymentStatus: 'pending' | 'paid';
  deliveryType: 'quick' | 'normal';
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
}

export const orderService = {
  // Get all orders
  getOrders: async (): Promise<Order[]> => {
    await delay(400);
    return getStoredOrders().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order | undefined> => {
    await delay(300);
    const orders = getStoredOrders();
    return orders.find(o => o.id === id);
  },

  // Create order
  createOrder: async (params: CreateOrderParams): Promise<Order> => {
    await delay(1000);
    const orders = getStoredOrders();
    
    // Get unique pharmacy IDs from cart items
    const pharmacyIds = [...new Set(params.items.map(item => item.medicine.pharmacyId))];
    
    // Get primary pharmacy
    const primaryPharmacy = mockPharmacies.find(p => p.id === pharmacyIds[0]) || mockPharmacies[0];
    
    const newOrder: Order = {
      id: 'ORD' + Date.now(),
      userId: 'user_1', // Would come from auth context
      items: params.items,
      pharmacyIds,
      totalAmount: params.totalAmount,
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      discount: params.discount,
      deliveryType: params.deliveryType,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentStatus,
      address: params.address,
      status: 'confirmed',
      createdAt: new Date(),
      estimatedDelivery: params.deliveryType === 'quick' ? '10-15 mins' : '25-35 mins',
      pharmacy: primaryPharmacy,
      couponCode: params.couponCode,
    };
    
    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    await delay(400);
    const orders = getStoredOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    orders[index].status = status;
    saveOrders(orders);
    return orders[index];
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<void> => {
    await delay(500);
    const orders = getStoredOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    if (orders[index].status !== 'confirmed') {
      throw new Error('Order cannot be cancelled at this stage');
    }
    
    orders[index].status = 'cancelled';
    saveOrders(orders);
  },

  // Simulate order progress (for demo)
  simulateOrderProgress: async (id: string): Promise<void> => {
    const statuses: Order['status'][] = ['confirmed', 'packed', 'out_for_delivery', 'delivered'];
    const orders = getStoredOrders();
    const order = orders.find(o => o.id === id);
    
    if (!order) return;
    
    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex < statuses.length - 1) {
      order.status = statuses[currentIndex + 1];
      saveOrders(orders);
    }
  },
};

export default orderService;
