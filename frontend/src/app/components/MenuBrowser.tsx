import type { MenuItemWithAvailability } from '../../api/menuApi';
import '../../styles/MenuBrowser.css';

interface MenuBrowserProps {
  items: MenuItemWithAvailability[];
  onAddToCart: (item: MenuItemWithAvailability) => void;
}

export default function MenuBrowser({ items, onAddToCart }: MenuBrowserProps) {
  return (
    <div className="menu-browser">
      {items.length === 0 ? (
        <p className="menu-browser__empty">No menu items available.</p>
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
                  🍽️
                </div>
              )}
              <div className="menu-browser__card-body">
                <h3 className="menu-browser__card-name">{item.name}</h3>
                <p className="menu-browser__card-description">{item.description}</p>
                <p className="menu-browser__card-price">
                  ${item.price.toFixed(2)}
                </p>
                <span
                  className={`menu-browser__badge${item.available === false ? ' menu-browser__badge--unavailable' : ' menu-browser__badge--available'}`}
                >
                  {item.available === false ? 'Unavailable' : 'Available'}
                </span>
              </div>
              <button
                className="menu-browser__add-btn"
                onClick={() => onAddToCart(item)}
                disabled={item.available === false}
                aria-label={`Add ${item.name} to cart`}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
