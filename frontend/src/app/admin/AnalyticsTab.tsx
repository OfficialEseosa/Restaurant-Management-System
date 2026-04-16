import { useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import '../../styles/admin/AnalyticsTab.css';

// TODO (John): replace all mock data with getAllAnalytics(startDate, endDate) from src/api/analyticsApi.ts
// belowThreshold flag on inventory forecast items controls the red highlight

const mockRevenue = [
  { date: 'Apr 10', revenue: 240 },
  { date: 'Apr 11', revenue: 310 },
  { date: 'Apr 12', revenue: 185 },
  { date: 'Apr 13', revenue: 420 },
  { date: 'Apr 14', revenue: 390 },
  { date: 'Apr 15', revenue: 510 },
];

const mockTopItems = [
  { name: 'Burger', qty: 84 },
  { name: 'Fries',  qty: 72 },
  { name: 'Soda',   qty: 61 },
  { name: 'Salad',  qty: 45 },
  { name: 'Wrap',   qty: 38 },
];

const mockOrderVolume = [
  { date: 'Apr 10', orders: 22 },
  { date: 'Apr 11', orders: 29 },
  { date: 'Apr 12', orders: 17 },
  { date: 'Apr 13', orders: 38 },
  { date: 'Apr 14', orders: 34 },
  { date: 'Apr 15', orders: 46 },
];

const mockInventory = [
  { name: 'Beef',    current: 12, demand: 18, belowThreshold: true  },
  { name: 'Lettuce', current: 30, demand: 15, belowThreshold: false },
  { name: 'Bread',   current:  5, demand: 20, belowThreshold: true  },
  { name: 'Tomato',  current: 22, demand: 12, belowThreshold: false },
  { name: 'Cheese',  current:  8, demand: 16, belowThreshold: true  },
];

const PRIMARY = '#2b6cb0';
const ACCENT  = '#e67e22';
const DANGER  = '#e53e3e';
const SAFE    = '#38a169';

export default function AnalyticsTab() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);

  function handleApply() {
    // TODO (John): call getAllAnalytics(startDate, endDate) from src/api/analyticsApi.ts and update chart data
    console.log('Apply range:', startDate, endDate);
  }

  return (
    <div className="tab-container analytics-tab">
      <div className="tab-header">
        <h2>Analytics</h2>
      </div>

      {/* ── Date range ── */}
      <div className="analytics-tab__filters">
        <label className="analytics-tab__filter-label">
          Start Date
          <input
            type="date"
            className="analytics-tab__date-input"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>
        <label className="analytics-tab__filter-label">
          End Date
          <input
            type="date"
            className="analytics-tab__date-input"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>
        <button className="btn-create analytics-tab__apply-btn" onClick={handleApply}>
          Apply
        </button>
      </div>

      {/* ── 2×2 chart grid ── */}
      <div className="analytics-tab__grid">

        {/* 1. Revenue Over Time */}
        <div className="analytics-tab__panel">
          <h3 className="analytics-tab__panel-title">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`$${v}`, 'Revenue']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Top-Selling Items */}
        <div className="analytics-tab__panel">
          <h3 className="analytics-tab__panel-title">Top-Selling Items</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockTopItems} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="qty" name="Units Sold" fill={ACCENT} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Order Volume */}
        <div className="analytics-tab__panel">
          <h3 className="analytics-tab__panel-title">Order Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockOrderVolume} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" name="Orders" fill={PRIMARY} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Inventory Forecast */}
        <div className="analytics-tab__panel">
          <h3 className="analytics-tab__panel-title">Inventory Forecast</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockInventory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" name="Current Stock" radius={[3, 3, 0, 0]}>
                {mockInventory.map((entry, index) => (
                  <Cell key={index} fill={entry.belowThreshold ? DANGER : SAFE} />
                ))}
              </Bar>
              <Bar dataKey="demand" name="Est. Demand" fill="#a0aec0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="analytics-tab__legend-note">
            <span className="analytics-tab__dot analytics-tab__dot--danger" /> Below threshold
          </p>
        </div>

      </div>
    </div>
  );
}
