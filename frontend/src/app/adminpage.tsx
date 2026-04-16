import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IngredientsTab from './components/IngredientsTab';
import MenuItemsTab from './components/MenuItemsTab';
import InventoryTab from './components/InventoryTab';
import StockLogTab from './components/StockLogTab';
import OrdersTab from './components/OrdersTab';
import AnalyticsTab from './components/AnalyticsTab';
import '../styles/adminpage.css';

type Tab = 'ingredients' | 'menu-items' | 'inventory' | 'stock-log' | 'orders' | 'analytics';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || user.role !== 'ADMIN') navigate('/login');
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Panel</h1>
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
                <span className="admin-profile-name">
                  {JSON.parse(localStorage.getItem('user') || '{}').username ?? 'Admin'}
                </span>
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
        <button
          className={`admin-tab-btn${activeTab === 'ingredients' ? ' active' : ''}`}
          onClick={() => setActiveTab('ingredients')}
          aria-selected={activeTab === 'ingredients'}
          role="tab"
        >
          Ingredients
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'menu-items' ? ' active' : ''}`}
          onClick={() => setActiveTab('menu-items')}
          aria-selected={activeTab === 'menu-items'}
          role="tab"
        >
          Menu Items
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'inventory' ? ' active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          aria-selected={activeTab === 'inventory'}
          role="tab"
        >
          Inventory
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'stock-log' ? ' active' : ''}`}
          onClick={() => setActiveTab('stock-log')}
          aria-selected={activeTab === 'stock-log'}
          role="tab"
        >
          Stock Log
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'orders' ? ' active' : ''}`}
          onClick={() => setActiveTab('orders')}
          aria-selected={activeTab === 'orders'}
          role="tab"
        >
          Orders
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'analytics' ? ' active' : ''}`}
          onClick={() => setActiveTab('analytics')}
          aria-selected={activeTab === 'analytics'}
          role="tab"
        >
          Analytics
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'ingredients' && <IngredientsTab />}
        {activeTab === 'menu-items' && <MenuItemsTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'stock-log' && <StockLogTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  );
}
