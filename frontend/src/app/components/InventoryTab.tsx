import React, { useEffect, useState } from 'react';
import type { IngredientWithStock } from '../../api/adminApi';
import { getIngredientsWithStock, updateStock, logStockChange } from '../../api/adminApi';
import '../../styles/InventoryTab.css';

const DEV_ADMIN_USER_ID = 1; // TODO: replace with session/JWT auth

interface InventoryTabState {
  rows: IngredientWithStock[];
  pendingEdits: Record<number, string>;
  loading: boolean;
  fetchError: string | null;
  saveErrors: Record<number, string>;
}

export default function InventoryTab() {
  const [rows, setRows] = useState<InventoryTabState['rows']>([]);
  const [pendingEdits, setPendingEdits] = useState<InventoryTabState['pendingEdits']>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<InventoryTabState['fetchError']>(null);
  const [saveErrors, setSaveErrors] = useState<InventoryTabState['saveErrors']>({});

  async function fetchInventory() {
    setLoading(true);
    setFetchError(null);
    try {
      // TODO (John)
      const data = await getIngredientsWithStock();
      setRows(data);
    } catch {
      setFetchError('Failed to load inventory. Please try again.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  function handleQuantityChange(id: number, value: string) {
    setPendingEdits(prev => ({ ...prev, [id]: value }));
  }

  async function handleSave(row: IngredientWithStock) {
    const rawValue = pendingEdits[row.ingredientId] ?? String(row.quantityOnHand);
    const newQuantity = parseInt(rawValue, 10);

    if (isNaN(newQuantity) || newQuantity < 0) {
      setSaveErrors(prev => ({ ...prev, [row.ingredientId]: 'Quantity must be 0 or greater' }));
      return;
    }

    setSaveErrors(prev => {
      const next = { ...prev };
      delete next[row.ingredientId];
      return next;
    });

    try {
      // TODO (John)
      await updateStock(row.ingredientId, newQuantity);
    } catch {
      setSaveErrors(prev => ({ ...prev, [row.ingredientId]: 'Failed to update stock. Please try again.' }));
      return;
    }

    try {
      // TODO (John)
      await logStockChange({
        adminUser: { userId: DEV_ADMIN_USER_ID },
        ingredient: { ingredientId: row.ingredientId },
        changeAmount: newQuantity - row.quantityOnHand,
      });
    } catch {
      setSaveErrors(prev => ({ ...prev, [row.ingredientId]: 'Stock updated but failed to record log entry.' }));
      return;
    }

    setRows(prev =>
      prev.map(r =>
        r.ingredientId === row.ingredientId ? { ...r, quantityOnHand: newQuantity } : r
      )
    );
    setPendingEdits(prev => {
      const next = { ...prev };
      delete next[row.ingredientId];
      return next;
    });
  }

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Inventory</h2>
      </div>

      {fetchError && (
        <div role="alert" className="alert-banner">
          {fetchError}
        </div>
      )}

      {loading ? (
        <p className="empty-text">Loading inventory…</p>
      ) : rows.length === 0 ? (
        <p className="empty-text">No ingredients found.</p>
      ) : (
        <table className="data-table" aria-label="Inventory table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit</th>
              <th>Quantity on Hand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <React.Fragment key={row.ingredientId}>
                <tr>
                  <td>{row.name}</td>
                  <td>{row.unit}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      className="quantity-input"
                      value={pendingEdits[row.ingredientId] ?? String(row.quantityOnHand)}
                      onChange={e => handleQuantityChange(row.ingredientId, e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSave(row);
                      }}
                      aria-label={`Quantity for ${row.name}`}
                    />
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-save"
                      onClick={() => handleSave(row)}
                      aria-label={`Save ${row.name}`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
                {saveErrors[row.ingredientId] && (
                  <tr>
                    <td colSpan={4}>
                      <span className="row-error">{saveErrors[row.ingredientId]}</span>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
