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

// Compute total for a single order
export const calcOrderTotal = (order: Order): number =>
  order.orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceAtTime,
    0
  );

// Customer: place an order (atomic — backend handles price snapshot)
export const placeOrder = (payload: PlaceOrderPayload): Promise<Order> =>
  api.post<Order>('/api/orders/place', payload).then(r => r.data);

// Customer: order history for the logged-in user
export const getOrdersByUser = (userId: number): Promise<Order[]> =>
  api.get<Order[]>(`/api/orders/user/${userId}`).then(r => r.data);
