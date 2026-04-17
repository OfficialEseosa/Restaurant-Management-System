import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IngredientsTab from './components/IngredientsTab';
import MenuItemsTab from './components/MenuItemsTab';
import InventoryTab from './components/InventoryTab';
import StockLogTab from './components/StockLogTab';
import OrdersTab from './components/OrdersTab';
import AnalyticsTab from './components/AnalyticsTab';
import '../styles/adminpage.css';

type Tab = 'ingredients' | 'menu-items' | 'inventory' | 'stock-log' | 'orders' | 'analytics';

interface StoredUser {
  username: string;
  role: string;
}

const ADMIN_TABS: Array<{ key: Tab; label: string }> = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'menu-items', label: 'Menu Items' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'stock-log', label: 'Stock Log' },
  { key: 'orders', label: 'Orders' },
  { key: 'analytics', label: 'Analytics' },
];

function readStoredUser(): StoredUser | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('user') || 'null');
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'username' in parsed
      && 'role' in parsed
      && typeof parsed.username === 'string'
      && typeof parsed.role === 'string'
    ) {
      return {
        username: parsed.username,
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useMemo(() => readStoredUser(), []);

  const activeTabLabel = ADMIN_TABS.find(tab => tab.key === activeTab)?.label ?? 'Ingredients';

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') navigate('/login');
  }, [navigate, user]);

  useEffect(() => {
    if (!profileOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [profileOpen]);

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="admin-page">
      <header className="admin-page__topbar">
        <div className="admin-page__brand-block">
          <span className="admin-page__brand-logo">RMS</span>
          <div className="admin-page__brand-copy">
            <p className="admin-page__brand-kicker">Admin Workspace</p>
            <h1 className="admin-page__brand-title">Operations Console</h1>
          </div>
        </div>

        <div className="admin-page__top-actions">
          <div className="admin-page__stats" aria-label="Admin context">
            <span className="admin-page__stat">
              <strong>{ADMIN_TABS.length}</strong> modules
            </span>
            <span className="admin-page__stat">
              Viewing <strong>{activeTabLabel}</strong>
            </span>
          </div>

          <div className="admin-page__profile" ref={profileRef}>
            <button
              className="admin-page__profile-btn"
              onClick={() => setProfileOpen(prev => !prev)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              {(user?.username[0] ?? 'A').toUpperCase()}
            </button>
            {profileOpen && (
              <div className="admin-page__profile-dropdown" role="menu">
                <div className="admin-page__profile-info">
                  <span className="admin-page__profile-name">
                    {user?.username ?? 'Admin'}
                  </span>
                  <span className="admin-page__profile-role">Administrator</span>
                </div>
                <hr className="admin-page__profile-divider" />
                <button
                  className="admin-page__profile-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="admin-page__tabs" aria-label="Admin tabs" role="tablist">
        {ADMIN_TABS.map(tab => (
          <button
            key={tab.key}
            className={`admin-page__tab${activeTab === tab.key ? ' admin-page__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            aria-selected={activeTab === tab.key}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-page__body">
        <section className="admin-page__content-shell">
          {activeTab === 'ingredients' && <IngredientsTab />}
          {activeTab === 'menu-items' && <MenuItemsTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'stock-log' && <StockLogTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </section>
      </main>
    </div>
  );
}
