import { useEffect, useState } from 'react';
import '../../styles/admin/OrdersTab.css';

// TODO (John): replace mockOrders with getAllOrders() from src/api/orderApi.ts
const mockOrders: Order[] = [];

interface OrderItem {
  orderItemId: number;
  menuItem: { menuItemId: number; name: string };
  quantity: number;
  unitPriceAtTime: number;
}

interface Order {
  orderId: number;
  customer?: { userId: number; username: string };
  placedAt: string;
  status: string;
  orderItems: OrderItem[];
}

const STATUS_FLOW = ['PLACED', 'READY', 'COMPLETE', 'CANCELLED'];

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      setFetchError(null);
      try {
        // TODO (John): replace mockOrders with getAllOrders() from src/api/orderApi.ts
        setOrders(mockOrders);
      } catch {
        setFetchError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  function handleStatusChange(orderId: number, newStatus: string) {
    // TODO (John): on status change call PATCH /api/orders/{id}/status directly or via a helper in orderApi.ts
    setOrders(prev =>
      prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o)
    );
  }

  const orderTotal = (order: Order) =>
    order.orderItems.reduce((sum, i) => sum + i.quantity * i.unitPriceAtTime, 0);

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Orders</h2>
      </div>

      {fetchError && (
        <div role="alert" className="alert-banner">{fetchError}</div>
      )}

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="empty-text">No orders yet.</p>
      ) : (
        <table className="data-table" aria-label="Orders table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <>
                <tr key={order.orderId}>
                  <td>#{order.orderId}</td>
                  <td>{order.customer?.username ?? '—'}</td>
                  <td>{new Date(order.placedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  <td>
                    <span className={`orders-tab__status orders-tab__status--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>${orderTotal(order).toFixed(2)}</td>
                  <td className="actions-cell">
                    <select
                      className="orders-tab__status-select"
                      value={order.status}
                      onChange={e => handleStatusChange(order.orderId, e.target.value)}
                      aria-label={`Change status for order ${order.orderId}`}
                    >
                      {STATUS_FLOW.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      className="btn-edit"
                      onClick={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
                      aria-label={`View items for order ${order.orderId}`}
                    >
                      {expandedId === order.orderId ? 'Hide' : 'View Items'}
                    </button>
                  </td>
                </tr>
                {expandedId === order.orderId && (
                  <tr key={`${order.orderId}-items`} className="orders-tab__expanded-row">
                    <td colSpan={6}>
                      <ul className="orders-tab__item-list">
                        {order.orderItems.map(item => (
                          <li key={item.orderItemId} className="orders-tab__item">
                            <span>{item.menuItem.name}</span>
                            <span>× {item.quantity}</span>
                            <span>${item.unitPriceAtTime.toFixed(2)} each</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
