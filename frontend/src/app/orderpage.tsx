import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MenuItemWithAvailability } from '../api/menuApi';
import { getMenuItemsWithAvailability } from '../api/menuApi';
import type { CartEntry } from '../api/customerOrderApi';
import MenuBrowser from './components/MenuBrowser';
import CartPanel from './components/CartPanel';
import OrderHistory from './components/OrderHistory';
import '../styles/orderpage.css';

type Tab = 'menu' | 'history';

export default function OrderPage() {
  const [tab, setTab] = useState<Tab>('menu');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/login');
  }
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithAvailability[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) { navigate('/login'); return; }

    async function fetchMenu() {
      try {
        const data = await getMenuItemsWithAvailability();
        setMenuItems(data);
      } catch {
        setError('Failed to load menu. Please try again.');
      }
    }
    fetchMenu();
  }, [navigate]);

  function handleAddToCart(item: MenuItemWithAvailability): void {
    setCart(prev => {
      const existing = prev.find(e => e.menuItem.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(e =>
          e.menuItem.menuItemId === item.menuItemId
            ? { ...e, quantity: e.quantity + 1 }
            : e
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function handleUpdateQuantity(menuItemId: number, quantity: number): void {
    setCart(prev =>
      prev.map(e =>
        e.menuItem.menuItemId === menuItemId ? { ...e, quantity } : e
      )
    );
  }

  function handleRemoveItem(menuItemId: number): void {
    setCart(prev => prev.filter(e => e.menuItem.menuItemId !== menuItemId));
  }

  return (
    <div className="order-page">
      <header className="order-page__header">
        <span className="order-page__header-title">Order</span>
        <div className="order-page__profile" ref={profileRef}>
          <button
            className="order-page__profile-btn"
            onClick={() => setProfileOpen(prev => !prev)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            👤
          </button>
          {profileOpen && (
            <div className="order-page__profile-dropdown" role="menu">
              <div className="order-page__profile-info">
                <span className="order-page__profile-name">
                  {JSON.parse(localStorage.getItem('user') || '{}').username ?? 'Customer'}
                </span>
                <span className="order-page__profile-role">Customer</span>
              </div>
              <hr className="order-page__profile-divider" />
              <button
                className="order-page__profile-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="order-page__tabs" aria-label="Order page tabs">
        <button
          className={`order-page__tab${tab === 'menu' ? ' order-page__tab--active' : ''}`}
          onClick={() => setTab('menu')}
          aria-current={tab === 'menu' ? 'page' : undefined}
        >
          Menu
        </button>
        <button
          className={`order-page__tab${tab === 'history' ? ' order-page__tab--active' : ''}`}
          onClick={() => setTab('history')}
          aria-current={tab === 'history' ? 'page' : undefined}
        >
          My Orders
        </button>
      </nav>

      <div className="order-page__body">
        {error && (
          <div role="alert" className="order-page__error">
            {error}
          </div>
        )}

        {tab === 'menu' && (
          <div className="order-page__menu-layout">
            <MenuBrowser items={menuItems} onAddToCart={handleAddToCart} />
            <CartPanel
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onOrderPlaced={() => setCart([])}
            />
          </div>
        )}

        {tab === 'history' && <OrderHistory />}
      </div>
    </div>
  );
}
