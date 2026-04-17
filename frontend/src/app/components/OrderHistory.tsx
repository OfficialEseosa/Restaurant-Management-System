import { useEffect, useState } from 'react';
import type { Order } from '../../api/customerOrderApi';
import { calcOrderTotal, getOrdersByUser } from '../../api/customerOrderApi';
import '../../styles/OrderHistory.css';

function statusClassName(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'placed') return 'order-history__status--placed';
  if (normalized === 'ready') return 'order-history__status--ready';
  if (normalized === 'complete') return 'order-history__status--complete';
  if (normalized === 'cancelled') return 'order-history__status--cancelled';
  return 'order-history__status--placed';
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getOrdersByUser(user.userId);
        setOrders(data);
      } catch {
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const totalSpent = orders.reduce((sum, order) => sum + calcOrderTotal(order), 0);
  const totalItems = orders.reduce(
    (sum, order) => sum + order.orderItems.reduce((lineSum, line) => lineSum + line.quantity, 0),
    0,
  );

  if (loading) {
    return <p className="order-history__loading">Loading order history...</p>;
  }

  return (
    <div className="order-history">
      <h2 className="order-history__title">My Orders</h2>

      {!error && orders.length > 0 && (
        <div className="order-history__summary">
          <div className="order-history__metric">
            <span className="order-history__metric-label">Orders</span>
            <strong className="order-history__metric-value">{orders.length}</strong>
          </div>
          <div className="order-history__metric">
            <span className="order-history__metric-label">Items Ordered</span>
            <strong className="order-history__metric-value">{totalItems}</strong>
          </div>
          <div className="order-history__metric">
            <span className="order-history__metric-label">Total Spent</span>
            <strong className="order-history__metric-value">${totalSpent.toFixed(2)}</strong>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="order-history__error">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <p className="order-history__empty">No orders yet.</p>
      )}

      {orders.length > 0 && (
        <ul className="order-history__list">
          {orders.map(order => (
            <li key={order.orderId} className="order-history__item">
              <div className="order-history__item-header">
                <span className="order-history__date">
                  {new Date(order.placedAt).toLocaleString()}
                </span>
                <span className={`order-history__status ${statusClassName(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <ul className="order-history__lines">
                {order.orderItems.map(line => (
                  <li key={line.orderItemId} className="order-history__line">
                    <span className="order-history__line-name">{line.menuItem.name}</span>
                    <span className="order-history__line-qty">x {line.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="order-history__total">
                Total: <strong>${calcOrderTotal(order).toFixed(2)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
