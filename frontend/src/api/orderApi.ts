import api from './axios';

export interface OrderItem {
  menuItemId: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  userId: number;
  items: OrderItem[];
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

export type OrderStatus = 'PLACED' | 'READY' | 'COMPLETE' | 'CANCELLED';

export const calcOrderTotal = (order: Order): number =>
  order.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPriceAtTime, 0);

const MIN_GRACE_SECONDS = 5;
const MAX_GRACE_SECONDS = 10;

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

export const placeOrder = (payload: PlaceOrderPayload) =>
  api.post<Order>('/api/orders/place', payload).then(r => r.data);

export const getOrdersByUser = (userId: number) =>
  api.get<Order[]>(`/api/orders/user/${userId}`).then(r => r.data);

export const getAllOrders = async (status?: OrderStatus): Promise<Order[]> => {
  const url = status ? `/api/orders?status=${status}` : '/api/orders';
  const response = await api.get<Order[]>(url);
  return response.data;
};

export const cancelOrder = async (orderId: number, userId: number): Promise<Order> => {
  const response = await api.post<Order>(`/api/orders/${orderId}/cancel`, { userId });
  return response.data;
};
