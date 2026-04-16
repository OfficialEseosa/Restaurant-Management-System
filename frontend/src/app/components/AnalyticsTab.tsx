import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import type {
  RevenuePoint,
  TopItem,
  OrderVolumePoint,
  InventoryForecastItem,
} from '../../api/analyticsApi';
import { getAllAnalytics } from '../../api/analyticsApi';
import '../../styles/AnalyticsTab.css';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsTab() {
  const [startDate, setStartDate] = useState(thirtyDaysAgoStr());
  const [endDate, setEndDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [orderVolume, setOrderVolume] = useState<OrderVolumePoint[]>([]);
  const [inventoryForecast, setInventoryForecast] = useState<InventoryForecastItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function handleApply() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAnalytics(startDate, endDate);
      setRevenue(data.revenue);
      setTopItems(data.topItems);
      setOrderVolume(data.orderVolume);
      setInventoryForecast(data.inventoryForecast);
      setHasLoaded(true);
    } catch {
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-container analytics-tab">
      <div className="tab-header">
        <h2>Analytics</h2>
        <div className="analytics-tab__controls">
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            max={endDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <label htmlFor="end-date">To</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate}
            onChange={e => setEndDate(e.target.value)}
          />
          <button
            className="btn-apply"
            onClick={handleApply}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Apply'}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert-banner">{error}</div>
      )}

      {!hasLoaded && !loading && (
        <p className="empty-text">Select a date range and click Apply.</p>
      )}

      {hasLoaded && (
        <div className="analytics-tab__panels">

          <section className="analytics-tab__panel">
            <h3>Revenue Over Time</h3>
            {revenue.length === 0 ? (
              <p className="empty-text">No data for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v) => `$${(v as number).toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#4f86c6" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="analytics-tab__panel">
            <h3>Order Volume</h3>
            {orderVolume.length === 0 ? (
              <p className="empty-text">No data for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={orderVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orderCount" stroke="#5cb85c" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="analytics-tab__panel">
            <h3>Top-Selling Items</h3>
            {topItems.length === 0 ? (
              <p className="empty-text">No data for this range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalQuantity" name="Qty Sold" fill="#4f86c6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="analytics-tab__panel">
            <h3>Inventory Forecast</h3>
            {inventoryForecast.length === 0 ? (
              <p className="empty-text">No forecast data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={inventoryForecast} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="ingredientName" width={120} />
                  <Tooltip
                    formatter={(value, name) =>
                      [`${value}`, name === 'currentStock' ? 'Current Stock' : 'Est. Demand']
                    }
                  />
                  <Legend />
                  <Bar dataKey="currentStock" name="Current Stock">
                    {inventoryForecast.map((item, i) => (
                      <Cell
                        key={i}
                        fill={item.belowThreshold ? '#d9534f' : '#5cb85c'}
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="estimatedDemand" name="Est. Demand" fill="#f0ad4e" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
