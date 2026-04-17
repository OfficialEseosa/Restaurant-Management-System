import { useEffect, useState, type ChangeEvent } from 'react';
import type { Order, OrderStatus } from '../../api/orderApi';
import {
  calcOrderTotal,
  getAllOrders,
  getCancellationRemainingSeconds,
} from '../../api/orderApi';
import '../../styles/OrdersTab.css';

const STATUS_OPTIONS: OrderStatus[] = ['PLACED', 'READY', 'COMPLETE', 'CANCELLED'];
const REFRESH_INTERVAL_MS = 2000;

function sortOrdersChronologically(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
  );
}

function formatStatus(status: string): string {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`;
}

function statusClassName(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === 'placed') return 'orders-tab__status orders-tab__status--placed';
  if (normalized === 'ready') return 'orders-tab__status orders-tab__status--ready';
  if (normalized === 'complete') return 'orders-tab__status orders-tab__status--complete';
  if (normalized === 'cancelled') return 'orders-tab__status orders-tab__status--cancelled';
  return 'orders-tab__status';
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [now, setNow] = useState(Date.now());

  async function fetchOrders(status?: OrderStatus) {
    try {
      const data = await getAllOrders(status);
      setOrders(sortOrdersChronologically(data));
      setFetchError(null);
    } catch {
      setFetchError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchOrders(filter || undefined);

    const refreshId = window.setInterval(() => {
      fetchOrders(filter || undefined);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(refreshId);
  }, [filter]);

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(tickId);
  }, []);

  function handleFilterChange(e: ChangeEvent<HTMLSelectElement>) {
    setFilter(e.target.value as OrderStatus | '');
  }

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Orders</h2>
        <div className="orders-tab__filter">
          <label htmlFor="status-filter">Filter by status</label>
          <select id="status-filter" value={filter} onChange={handleFilterChange}>
            <option value="">All</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{formatStatus(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {fetchError && (
        <div role="alert" className="alert-banner">{fetchError}</div>
      )}

      {loading ? (
        <p className="empty-text">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="empty-text">No orders found.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table" aria-label="Orders table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Placed</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const remainingSeconds = getCancellationRemainingSeconds(order, now);

                return (
                  <tr key={order.orderId}>
                    <td>#{order.orderId}</td>
                    <td>{new Date(order.placedAt).toLocaleString()}</td>
                    <td>
                      <ul className="orders-tab__items">
                        {order.orderItems.map(item => (
                          <li key={item.orderItemId}>
                            {item.menuItem.name} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>${calcOrderTotal(order).toFixed(2)}</td>
                    <td>
                      <div className="orders-tab__status-cell">
                        <span className={statusClassName(order.status)}>
                          {formatStatus(order.status)}
                        </span>
                        {order.status === 'PLACED' && (
                          <span className="orders-tab__countdown">
                            {remainingSeconds > 0
                              ? `Auto-completes in ${remainingSeconds}s`
                              : 'Completing...'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
