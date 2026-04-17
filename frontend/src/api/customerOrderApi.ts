import type { MenuItemWithAvailability } from './menuApi';
import api from './axios';

export interface CartEntry {
  menuItem: MenuItemWithAvailability;
  quantity: number;
}

export interface PlaceOrderPayload {
  userId: number;
  items: Array<{ menuItemId: number; quantity: number }>;
}

export interface OrderItemDetail {
  orderItemId: number;
  menuItem: { menuItemId: number; name: string };
  quantity: number;
  unitPriceAtTime: number;
}

export interface Order {
  orderId: number;
  status: string;
  placedAt: string;
  orderItems: OrderItemDetail[];
}

const MIN_GRACE_SECONDS = 5;
const MAX_GRACE_SECONDS = 10;

export const calcOrderTotal = (order: Order): number =>
  order.orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceAtTime,
    0
  );

export const getCancellationWindowSeconds = (order: Order): number => {
  const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const computed = MIN_GRACE_SECONDS + Math.max(totalQuantity - 1, 0);
  return Math.min(MAX_GRACE_SECONDS, computed);
};

export const getCancellationRemainingSeconds = (order: Order, now = Date.now()): number => {
  if (order.status !== 'PLACED') return 0;
  const placedAt = new Date(order.placedAt).getTime();
  const deadline = placedAt + getCancellationWindowSeconds(order) * 1000;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
};

export const placeOrder = (payload: PlaceOrderPayload): Promise<Order> =>
  api.post<Order>('/api/orders/place', payload).then(r => r.data);

export const cancelOrder = (orderId: number, userId: number): Promise<Order> =>
  api.post<Order>(`/api/orders/${orderId}/cancel`, { userId }).then(r => r.data);

export const getOrdersByUser = (userId: number): Promise<Order[]> =>
  api.get<Order[]>(`/api/orders/user/${userId}`).then(r => r.data);
