import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MenuCategory, MenuItemWithAvailability } from '../api/menuApi';
import { getMenuItemsWithAvailability } from '../api/menuApi';
import type { CartEntry } from '../api/customerOrderApi';
import MenuBrowser from './components/MenuBrowser';
import CartPanel from './components/CartPanel';
import OrderHistory from './components/OrderHistory';
import OrderSummary from './components/OrderSummary';
import '../styles/orderpage.css';

type Tab = 'menu' | 'history';
type View = 'menu' | 'checkout' | 'history';
type UiCategory = 'ALL' | MenuCategory;

const CATEGORY_OPTIONS: Array<{ key: UiCategory; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'BURGERS', label: 'Burgers' },
  { key: 'SANDWICHES', label: 'Sandwiches' },
  { key: 'FRIES', label: 'Fries' },
  { key: 'SIDES', label: 'Sides' },
  { key: 'BREAKFAST', label: 'Breakfast' },
  { key: 'SOUPS', label: 'Soups' },
  { key: 'SWEETS', label: 'Sweets' },
  { key: 'DRINKS', label: 'Drinks' },
];

const CATEGORY_LABELS: Record<MenuCategory, string> = {
  BURGERS: 'Burgers',
  SANDWICHES: 'Sandwiches',
  FRIES: 'Fries',
  SIDES: 'Sides',
  BREAKFAST: 'Breakfast',
  SOUPS: 'Soups',
  SWEETS: 'Sweets',
  DRINKS: 'Drinks',
};

const VALID_CATEGORIES: MenuCategory[] = [
  'BURGERS',
  'SANDWICHES',
  'FRIES',
  'SIDES',
  'BREAKFAST',
  'SOUPS',
  'SWEETS',
  'DRINKS',
];

function normalizeCategory(category: string | null | undefined): MenuCategory {
  if (category && VALID_CATEGORIES.includes(category as MenuCategory)) {
    return category as MenuCategory;
  }
  return 'SIDES';
}

function readStoredUser(): { userId: number; username: string } | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('user') || 'null');
    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'userId' in parsed
      && 'username' in parsed
      && typeof parsed.userId === 'number'
      && typeof parsed.username === 'string'
    ) {
      return { userId: parsed.userId, username: parsed.username };
    }
    return null;
  } catch {
    return null;
  }
}

export default function OrderPage() {
  const [tab, setTab] = useState<Tab>('menu');
  const [view, setView] = useState<View>('menu');
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<UiCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useMemo(() => readStoredUser(), []);

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/login');
  }
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithAvailability[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    async function fetchMenu() {
      setMenuLoading(true);
      setError(null);
      try {
        const data = await getMenuItemsWithAvailability();
        setMenuItems(
          data.map(item => ({
            ...item,
            category: normalizeCategory((item as { category?: string | null }).category),
          })),
        );
      } catch {
        setError('Failed to load menu. Please try again.');
      } finally {
        setMenuLoading(false);
      }
    }
    fetchMenu();
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

  const categoryCounts = useMemo(() => {
    const counts: Record<UiCategory, number> = {
      ALL: menuItems.length,
      BURGERS: 0,
      SANDWICHES: 0,
      FRIES: 0,
      SIDES: 0,
      BREAKFAST: 0,
      SOUPS: 0,
      SWEETS: 0,
      DRINKS: 0,
    };

    for (const item of menuItems) {
      counts[item.category] += 1;
    }
    return counts;
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return menuItems
      .filter(item => (activeCategory === 'ALL' ? true : item.category === activeCategory))
      .filter(item => {
        if (!normalizedQuery) return true;
        const haystack = `${item.name} ${item.description}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (a.available !== b.available) {
          return a.available ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  }, [activeCategory, menuItems, searchQuery]);

  const availableCount = useMemo(
    () => filteredMenuItems.filter(item => item.available).length,
    [filteredMenuItems],
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart],
  );

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
      <header className="order-page__topbar">
        <div className="order-page__brand-block">
          <span className="order-page__brand-logo">RMS</span>
          <div className="order-page__brand-copy">
            <p className="order-page__brand-kicker">Customer Ordering</p>
            <h1 className="order-page__brand-title">Build Your Meal</h1>
          </div>
        </div>

        <div className="order-page__top-actions">
          <div className="order-page__stats" aria-label="Ordering statistics">
            <span className="order-page__stat">
              {menuLoading ? (
                <>Loading menu...</>
              ) : (
                <><strong>{categoryCounts.ALL}</strong> menu items</>
              )}
            </span>
            <span className="order-page__stat">
              <strong>{cartItemCount}</strong> in cart
            </span>
          </div>

        <div className="order-page__profile" ref={profileRef}>
          <button
            className="order-page__profile-btn"
            onClick={() => setProfileOpen(prev => !prev)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            {(user?.username[0] ?? 'U').toUpperCase()}
          </button>
          {profileOpen && (
            <div className="order-page__profile-dropdown" role="menu">
              <div className="order-page__profile-info">
                <span className="order-page__profile-name">
                  {user?.username ?? 'Customer'}
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
        </div>
      </header>

      <nav className="order-page__tabs" aria-label="Order page tabs">
        <button
          className={`order-page__tab${tab === 'menu' ? ' order-page__tab--active' : ''}`}
          onClick={() => { setTab('menu'); setView('menu'); }}
          aria-current={tab === 'menu' ? 'page' : undefined}
        >
          Menu
        </button>
        <button
          className={`order-page__tab${tab === 'history' ? ' order-page__tab--active' : ''}`}
          onClick={() => { setTab('history'); setView('history'); }}
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

        {view === 'checkout' && (
          <OrderSummary
            cart={cart}
            onBack={() => setView('menu')}
            onViewOrders={() => { setCart([]); setTab('history'); setView('history'); }}
            onBackToMenu={() => { setCart([]); setView('menu'); }}
          />
        )}

        {view === 'menu' && (
          <div className="order-page__menu-layout">
            <section className="order-page__catalog">
              <div className="order-page__catalog-header">
                <div className="order-page__catalog-copy">
                  <h2 className="order-page__catalog-title">Menu</h2>
                  <p className="order-page__catalog-subtitle">
                    Browse by category and build your cart. Unavailable items stay visible for transparency.
                  </p>
                </div>

                <label className="order-page__search">
                  <span className="order-page__search-label">Search</span>
                  <input
                    type="search"
                    className="order-page__search-input"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Search burgers, fries, shakes..."
                    aria-label="Search menu items"
                  />
                </label>
              </div>

              <div className="order-page__category-row" role="tablist" aria-label="Menu categories">
                {CATEGORY_OPTIONS.map(option => (
                  <button
                    key={option.key}
                    className={`order-page__category-btn${activeCategory === option.key ? ' order-page__category-btn--active' : ''}`}
                    onClick={() => setActiveCategory(option.key)}
                    role="tab"
                    aria-selected={activeCategory === option.key}
                  >
                    <span>{option.label}</span>
                    <span className="order-page__category-count">
                      {menuLoading ? '...' : categoryCounts[option.key]}
                    </span>
                  </button>
                ))}
              </div>

              {menuLoading ? (
                <p className="order-page__results-meta">Loading menu items...</p>
              ) : (
                <p className="order-page__results-meta">
                  Showing {filteredMenuItems.length} item(s), {availableCount} available now.
                </p>
              )}

              <MenuBrowser
                items={filteredMenuItems}
                loading={menuLoading}
                onAddToCart={handleAddToCart}
                categoryLabels={CATEGORY_LABELS}
              />
            </section>

            <CartPanel
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={() => setView('checkout')}
            />
          </div>
        )}

        {view === 'history' && (
          <div className="order-page__history-layout">
            <OrderHistory />
          </div>
        )}
      </div>
    </div>
  );
}
