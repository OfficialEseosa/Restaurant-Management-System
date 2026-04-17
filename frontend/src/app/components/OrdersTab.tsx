import { Fragment, useEffect, useState, type ChangeEvent } from 'react';
import type { Order, OrderStatus } from '../../api/orderApi';
import { getAllOrders, calcOrderTotal, updateOrderStatus } from '../../api/orderApi';
import '../../styles/OrdersTab.css';

const STATUS_OPTIONS: OrderStatus[] = ['PLACED', 'READY', 'COMPLETE', 'CANCELLED'];

function formatStatus(status: OrderStatus): string {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [actionErrors, setActionErrors] = useState<Record<number, string>>({});

  async function fetchOrders(status?: OrderStatus) {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAllOrders(status);
      setOrders(data);
    } catch {
      setFetchError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function handleFilterChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as OrderStatus | '';
    setFilter(val);
    fetchOrders(val || undefined);
  }

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    setActionErrors(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });

    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status: updated.status } : o)));
    } catch {
      setActionErrors(prev => ({ ...prev, [orderId]: 'Failed to update status.' }));
    }
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
              {orders.map(order => (
                <Fragment key={order.orderId}>
                  <tr>
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
                      <select
                        className="orders-tab__status-select"
                        value={order.status}
                        aria-label={`Status for order ${order.orderId}`}
                        onChange={e => handleStatusChange(order.orderId, e.target.value as OrderStatus)}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{formatStatus(status)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {actionErrors[order.orderId] && (
                    <tr>
                      <td colSpan={5}>
                        <span className="row-error">{actionErrors[order.orderId]}</span>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
