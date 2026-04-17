import { useEffect, useState } from 'react';
import type { MenuItem, NewMenuItem } from '../../api/menuApi';
import { getAllMenuItems, deactivateMenuItem } from '../../api/menuApi';
import api from '../../api/axios';
import MenuItemForm from './MenuItemForm';
import type { MenuItemWithIngredients } from './MenuItemForm';
import '../../styles/MenuItemsTab.css';

const getMenuItemIngredientsByMenuItem = (menuItemId: number) =>
  api.get<MenuItemWithIngredients['menuItemIngredients']>(
    `/api/menu-item-ingredients/menu-item/${menuItemId}`
  ).then(r => r.data);

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function MenuItemsTab() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItemWithIngredients | null>(null);

  async function fetchMenuItems() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getAllMenuItems();
      setMenuItems(data);
    } catch {
      setFetchError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenuItems();
  }, []);

  function handleCreate() {
    setEditTarget(null);
    setActionError(null);
    setModalOpen(true);
  }

  async function handleEdit(item: MenuItem) {
    setActionError(null);
    try {
      const ingredients = await getMenuItemIngredientsByMenuItem(item.menuItemId);
      const itemWithIngredients: MenuItemWithIngredients = {
        ...item,
        menuItemIngredients: ingredients,
      };
      setEditTarget(itemWithIngredients);
      setModalOpen(true);
    } catch {
      setActionError('Failed to load menu item details. Please try again.');
    }
  }

  async function handleDeactivate(item: MenuItem) {
    setActionError(null);
    const currentData: NewMenuItem = {
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      imageUrl: item.imageUrl,
      active: item.active,
    };
    try {
      await deactivateMenuItem(item.menuItemId, currentData);
      setMenuItems(prev =>
        prev.map(mi =>
          mi.menuItemId === item.menuItemId ? { ...mi, active: false } : mi
        )
      );
    } catch {
      setActionError('Failed to deactivate menu item. Please try again.');
    }
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleSave() {
    setModalOpen(false);
    setEditTarget(null);
    fetchMenuItems();
  }

  return (
    <div className="tab-container">
      <div className="tab-header">
        <h2>Menu Items</h2>
        <button className="btn-create" onClick={handleCreate}>
          + Create Menu Item
        </button>
      </div>

      {actionError && (
        <div role="alert" className="alert-banner">
          {actionError}
        </div>
      )}

      {fetchError && (
        <div role="alert" className="alert-banner">
          {fetchError}
        </div>
      )}

      {loading ? (
        <p className="empty-text">Loading menu items...</p>
      ) : menuItems.length === 0 ? (
        <p className="empty-text">No menu items found. Create one to get started.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table" aria-label="Menu items table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.menuItemId}>
                  <td>{item.name}</td>
                  <td>{formatCategory(item.category)}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.description || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                      {item.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-deactivate"
                      onClick={() => handleDeactivate(item)}
                      disabled={!item.active}
                      aria-label={`Deactivate ${item.name}`}
                      aria-disabled={!item.active}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <MenuItemForm
          item={editTarget ?? undefined}
          onSave={handleSave}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}