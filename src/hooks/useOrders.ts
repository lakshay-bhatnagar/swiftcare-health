import { useEffect, useState } from 'react';
import orderService from '@/services/order.service';
import type { Order } from '@/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then(setOrders).finally(() => setLoading(false));
    const unsub = orderService.subscribeToOrderUpdates(() => orderService.getOrders().then(setOrders));
    return unsub;
  }, []);

  return { orders, loading, refresh: () => orderService.getOrders().then(setOrders) };
};
