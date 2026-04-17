import { useMemo } from 'react';
import type { CartEntry } from '../../api/customerOrderApi';
import '../../styles/CartPanel.css';

interface CartPanelProps {
  cart: CartEntry[];
  onUpdateQuantity: (menuItemId: number, quantity: number) => void;
  onRemoveItem: (menuItemId: number) => void;
  onCheckout: () => void;
}

export default function CartPanel({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartPanelProps) {
  const itemCount = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart],
  );

  const subTotal = cart.reduce(
    (sum, entry) => sum + entry.quantity * entry.menuItem.price,
    0,
  );
  const tax = subTotal * 0.08;
  const serviceFee = cart.length > 0 ? 1.5 : 0;
  const orderTotal = subTotal + tax + serviceFee;

  function handleQuantityChange(menuItemId: number, quantity: number): void {
    if (quantity <= 0) {
      onRemoveItem(menuItemId);
      return;
    }
    onUpdateQuantity(menuItemId, quantity);
  }

  return (
    <div className="cart-panel">
      <div className="cart-panel__header">
        <h2 className="cart-panel__title">Your Cart</h2>
        <span className="cart-panel__count-badge">{itemCount} item(s)</span>
      </div>
      <p className="cart-panel__subtitle">Add items from the menu, then checkout when ready.</p>

      {cart.length === 0 ? (
        <p className="cart-panel__empty">Your cart is empty.</p>
      ) : (
        <ul className="cart-panel__list">
          {cart.map(entry => (
            <li key={entry.menuItem.menuItemId} className="cart-panel__item">
              <div className="cart-panel__item-info">
                <span className="cart-panel__item-name">{entry.menuItem.name}</span>
                <span className="cart-panel__item-unit-price">
                  ${(entry.quantity * entry.menuItem.price).toFixed(2)}
                </span>
              </div>
              <div className="cart-panel__item-controls">
                <span className="cart-panel__qty-label">${entry.menuItem.price.toFixed(2)} each</span>
                <div className="cart-panel__qty-group" role="group" aria-label={`Quantity controls for ${entry.menuItem.name}`}>
                  <button
                    type="button"
                    className="cart-panel__qty-btn"
                    onClick={() => handleQuantityChange(entry.menuItem.menuItemId, entry.quantity - 1)}
                    aria-label={`Decrease quantity for ${entry.menuItem.name}`}
                  >
                    -
                  </button>
                  <input
                    id={`qty-${entry.menuItem.menuItemId}`}
                    type="number"
                    min={1}
                    value={entry.quantity}
                    className="cart-panel__qty-input"
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        handleQuantityChange(entry.menuItem.menuItemId, val);
                      }
                    }}
                    aria-label={`Quantity for ${entry.menuItem.name}`}
                  />
                  <button
                    type="button"
                    className="cart-panel__qty-btn"
                    onClick={() => handleQuantityChange(entry.menuItem.menuItemId, entry.quantity + 1)}
                    aria-label={`Increase quantity for ${entry.menuItem.name}`}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="cart-panel__remove-btn"
                  onClick={() => onRemoveItem(entry.menuItem.menuItemId)}
                  aria-label={`Remove ${entry.menuItem.name} from cart`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-panel__summary">
        <div className="cart-panel__summary-row">
          <span>Subtotal</span>
          <strong>${subTotal.toFixed(2)}</strong>
        </div>
        <div className="cart-panel__summary-row">
          <span>Tax (8%)</span>
          <strong>${tax.toFixed(2)}</strong>
        </div>
        <div className="cart-panel__summary-row">
          <span>Service fee</span>
          <strong>${serviceFee.toFixed(2)}</strong>
        </div>
        <div className="cart-panel__summary-row cart-panel__summary-row--total">
          <span>Total</span>
          <strong>${orderTotal.toFixed(2)}</strong>
        </div>
      </div>

      <div className="cart-panel__footer">
        <button
          className="cart-panel__place-order-btn"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          Checkout &rarr;
        </button>
        <p className="cart-panel__eta">Estimated prep time: 15–20 minutes.</p>
      </div>
    </div>
  );
}
