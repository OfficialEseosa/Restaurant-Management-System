import type { MenuItemWithAvailability } from '../../api/menuApi';
import '../../styles/MenuBrowser.css';

type MenuBrowserItem = MenuItemWithAvailability & {
  category?: string;
};

interface MenuBrowserProps {
  items: MenuBrowserItem[];
  onAddToCart: (item: MenuItemWithAvailability) => void;
  categoryLabels?: Record<string, string>;
}

export default function MenuBrowser({ items, onAddToCart, categoryLabels }: MenuBrowserProps) {
  return (
    <div className="menu-browser">
      {items.length === 0 ? (
        <div className="menu-browser__empty">
          <h3 className="menu-browser__empty-title">No matches found</h3>
          <p className="menu-browser__empty-text">Try another category or search term.</p>
        </div>
      ) : (
        <div className="menu-browser__grid">
          {items.map(item => (
            <div
              key={item.menuItemId}
              className={`menu-browser__card${item.available === false ? ' card--unavailable' : ''}`}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="menu-browser__card-image"
                />
              ) : (
                <div className="menu-browser__card-image-placeholder" aria-label="No image">
                  No Image
                </div>
              )}
              <div className="menu-browser__card-body">
                <h3 className="menu-browser__card-name">{item.name}</h3>
                <p className="menu-browser__card-description">{item.description}</p>

                <div className="menu-browser__meta-row">
                  {item.category && (
                    <span className="menu-browser__category-chip">
                      {categoryLabels?.[item.category] ?? item.category}
                    </span>
                  )}
                  <span
                    className={`menu-browser__availability${item.available === false ? ' menu-browser__availability--unavailable' : ''}`}
                  >
                    {item.available === false ? 'Unavailable' : 'Available'}
                  </span>
                </div>

                <p className="menu-browser__card-price">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <button
                className="menu-browser__add-btn"
                onClick={() => onAddToCart(item)}
                disabled={item.available === false}
                aria-label={`Add ${item.name} to cart`}
              >
                Add Item
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
