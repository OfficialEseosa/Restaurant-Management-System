import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IngredientsTab from './components/IngredientsTab';
import MenuItemsTab from './components/MenuItemsTab';
import InventoryTab from './components/InventoryTab';
import StockLogTab from './components/StockLogTab';
import OrdersTab from './admin/OrdersTab';
import AnalyticsTab from './admin/AnalyticsTab';
import '../styles/adminpage.css';

type Tab = 'ingredients' | 'menu-items' | 'inventory' | 'stock-log' | 'orders' | 'analytics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'menu-items',  label: 'Menu Items'  },
  { id: 'inventory',   label: 'Inventory'   },
  { id: 'stock-log',   label: 'Stock Log'   },
  { id: 'orders',      label: 'Orders'      },
  { id: 'analytics',   label: 'Analytics'   },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  function handleLogout() {
    // TODO (John): clear auth token/session when auth is wired up
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-profile" ref={profileRef}>
          <button
            className="admin-profile-btn"
            onClick={() => setProfileOpen(prev => !prev)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            👤
          </button>
          {profileOpen && (
            <div className="admin-profile-dropdown" role="menu">
              <div className="admin-profile-info">
                <span className="admin-profile-name">Admin</span>
                <span className="admin-profile-role">Administrator</span>
              </div>
              <hr className="admin-profile-divider" />
              <button
                className="admin-profile-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="admin-tab-bar" aria-label="Admin tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {activeTab === 'ingredients' && <IngredientsTab />}
        {activeTab === 'menu-items'  && <MenuItemsTab />}
        {activeTab === 'inventory'   && <InventoryTab />}
        {activeTab === 'stock-log'   && <StockLogTab />}
        {activeTab === 'orders'      && <OrdersTab />}
        {activeTab === 'analytics'   && <AnalyticsTab />}
      </main>
    </div>
  );
}
