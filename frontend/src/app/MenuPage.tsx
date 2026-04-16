import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MenuItemWithAvailability } from '../api/menuApi';
import type { CartEntry } from '../api/customerOrderApi';
import MenuBrowser from './components/MenuBrowser';
import CartPanel from './components/CartPanel';
import '../styles/MenuPage.css';

// TODO (John): replace mockItems with getMenuItemsWithAvailability() from src/api/menuApi.ts
const mockItems: MenuItemWithAvailability[] = [
  { menuItemId: 1, name: 'Burger', price: 9.99, available: true, active: true, description: 'A classic beef burger.', imageUrl: '' },
  { menuItemId: 2, name: 'Fries', price: 3.49, available: true, active: true, description: 'Golden crispy fries.', imageUrl: '' },
  { menuItemId: 3, name: 'Soda', price: 1.99, available: false, active: true, description: 'Ice cold soft drink.', imageUrl: '' },
];

export default function MenuPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItemWithAvailability[]>([]);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      setError(null);
      try {
        // TODO (John): replace mockItems with getMenuItemsWithAvailability() from src/api/menuApi.ts
        setMenuItems(mockItems);
      } catch {
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  function handleAddToCart(item: MenuItemWithAvailability) {
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

  function handleUpdateQuantity(menuItemId: number, quantity: number) {
    setCart(prev =>
      prev.map(e => e.menuItem.menuItemId === menuItemId ? { ...e, quantity } : e)
    );
  }

  function handleRemoveItem(menuItemId: number) {
    setCart(prev => prev.filter(e => e.menuItem.menuItemId !== menuItemId));
  }

  const cartCount = cart.reduce((sum, e) => sum + e.quantity, 0);

  return (
    <div className="menu-page">
      {/* ── Header ── */}
      <header className="menu-page__header">
        <div className="menu-page__header-left">
          <button
            className="menu-page__back-btn"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            ← Dashboard
          </button>
          <span className="menu-page__logo">🍴 RestaurantOS</span>
        </div>
        <button
          ref={cartBtnRef}
          className="menu-page__cart-btn"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${cartCount} items`}
        >
          🛒
          {cartCount > 0 && (
            <span className="menu-page__cart-badge">{cartCount}</span>
          )}
        </button>
      </header>

      {/* ── Page title ── */}
      <div className="menu-page__hero">
        <h1 className="menu-page__title">Our Menu</h1>
        <p className="menu-page__tagline">Fresh ingredients, made to order.</p>
      </div>

      {/* ── Content ── */}
      <main className="menu-page__body">
        {loading && <p className="menu-page__loading">Loading...</p>}
        {error && <p className="menu-page__error">Something went wrong.</p>}
        {!loading && !error && (
          <MenuBrowser items={menuItems} onAddToCart={handleAddToCart} />
        )}
      </main>

      {/* ── Cart drawer overlay ── */}
      {cartOpen && (
        <div
          className="menu-page__cart-overlay"
          onClick={() => setCartOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Cart drawer ── */}
      <aside
        className={`menu-page__cart-drawer${cartOpen ? ' menu-page__cart-drawer--open' : ''}`}
        aria-label="Shopping cart"
      >
        <button
          className="menu-page__cart-close"
          onClick={() => setCartOpen(false)}
          aria-label="Close cart"
        >
          ✕
        </button>
        <CartPanel
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onOrderPlaced={() => { setCart([]); setCartOpen(false); }}
        />
      </aside>
    </div>
  );
}
