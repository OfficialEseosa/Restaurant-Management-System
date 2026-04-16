import { useEffect, useState } from 'react';
import api from '../../api/axios';
import '../../styles/StockLogTab.css';

interface StockChangeLogEntry {
  stockChangeId: number;
  adminUser: { userId: number; username: string };
  ingredient: { ingredientId: number; name: string; unit: string };
  changeAmount: number;
  changedAt: string;
}

const getAllStockLogs = (): Promise<StockChangeLogEntry[]> =>
  // TODO (John)
  api.get<StockChangeLogEntry[]>('/api/stock-change-logs').then(r => r.data);

export function sortLogsDescending(logs: StockChangeLogEntry[]): StockChangeLogEntry[] {
  return [...logs].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );
}

export function formatChangeAmount(amount: number): string {
  if (amount > 0) return `+${amount}`;
  if (amount < 0) return `-${Math.abs(amount)}`;
  return '0';
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

interface StockLogTabState {
  logs: StockChangeLogEntry[];
  loading: boolean;
  fetchError: string | null;
}

export default function StockLogTab() {
  const [logs, setLogs] = useState<StockLogTabState['logs']>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<StockLogTabState['fetchError']>(null);

  async function fetchLogs() {
    setLoading(true);
    setFetchError(null);
    try {
      // TODO (John)
      const rawLogs = await getAllStockLogs();
      setLogs(sortLogsDescending(rawLogs));
    } catch {
      setFetchError('Failed to load stock change log. Please try again.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  function getChangeClass(amount: number): string {
    if (amount > 0) return 'change-positive';
    if (amount < 0) return 'change-negative';
    return 'change-zero';
  }

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Stock Log</h2>
      </div>

      {fetchError && (
        <div role="alert" className="alert-banner">
          {fetchError}
        </div>
      )}

      {loading ? (
        <p className="empty-text">Loading stock log…</p>
      ) : logs.length === 0 ? (
        <p className="empty-text">No stock changes have been recorded yet.</p>
      ) : (
        <table className="data-table" aria-label="Stock log table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Change</th>
              <th>Admin</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(entry => (
              <tr key={entry.stockChangeId}>
                <td>{entry.ingredient.name}</td>
                <td>
                  <span className={getChangeClass(entry.changeAmount)}>
                    {formatChangeAmount(entry.changeAmount)}
                  </span>
                </td>
                <td>{entry.adminUser.username}</td>
                <td>{formatTimestamp(entry.changedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
