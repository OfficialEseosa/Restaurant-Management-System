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

// Compute total for a single order
export const calcOrderTotal = (order: Order): number =>
  order.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPriceAtTime, 0);

// Customer: place an order (atomic — backend handles inventory deduction)
export const placeOrder = (payload: PlaceOrderPayload) =>
  api.post<Order>('/api/orders/place', payload).then(r => r.data);

// Customer: order history for the logged-in user
export const getOrdersByUser = (userId: number) =>
  api.get<Order[]>(`/api/orders/user/${userId}`).then(r => r.data);

// Admin: all orders, optional status filter
export type OrderStatus = 'PLACED' | 'READY' | 'COMPLETE' | 'CANCELLED';

export const getAllOrders = async (status?: OrderStatus): Promise<Order[]> => {
  const url = status ? `/api/orders?status=${status}` : '/api/orders';
  const response = await api.get<Order[]>(url);
  return response.data;
};

// Admin: update order status
export const updateOrderStatus = async (id: number, status: OrderStatus): Promise<Order> => {
  const response = await api.patch<Order>(`/api/orders/${id}/status`, { status });
  return response.data;
};
