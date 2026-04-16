import { useEffect, useState } from 'react';
import type { Order } from '../../api/customerOrderApi';
import { calcOrderTotal, getOrdersByUser } from '../../api/customerOrderApi';
import '../../styles/OrderHistory.css';


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

  if (loading) {
    return <p className="order-history__loading">Loading order history…</p>;
  }

  return (
    <div className="order-history">
      <h2 className="order-history__title">My Orders</h2>

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
                <span className={`order-history__status order-history__status--${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <ul className="order-history__lines">
                {order.orderItems.map(line => (
                  <li key={line.orderItemId} className="order-history__line">
                    <span className="order-history__line-name">{line.menuItem.name}</span>
                    <span className="order-history__line-qty">× {line.quantity}</span>
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
