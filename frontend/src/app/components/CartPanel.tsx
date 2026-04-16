import { useState } from 'react';
import type { CartEntry } from '../../api/customerOrderApi';
import { placeOrder } from '../../api/customerOrderApi';
import '../../styles/CartPanel.css';

const DEV_USER_ID = 1; // TODO: replace with session/JWT auth

interface CartPanelProps {
  cart: CartEntry[];
  onUpdateQuantity: (menuItemId: number, quantity: number) => void;
  onRemoveItem: (menuItemId: number) => void;
  onOrderPlaced: () => void;
}

export default function CartPanel({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
}: CartPanelProps) {
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cartTotal = cart.reduce(
    (sum, entry) => sum + entry.quantity * entry.menuItem.price,
    0
  );

  async function handlePlaceOrder() {
    setSuccess(null);
    setError(null);
    try {
      //TODO (John) call placeOrder({ userId: DEV_USER_ID, items: cart.map(e => ({ menuItemId: e.menuItem.menuItemId, quantity: e.quantity })) })
      await placeOrder({
        userId: DEV_USER_ID,
        items: cart.map(e => ({ menuItemId: e.menuItem.menuItemId, quantity: e.quantity })),
      });
      onOrderPlaced();
      setSuccess('Order placed successfully!');
    } catch {
      setError('Failed to place order. Please try again.');
    }
  }

  return (
    <div className="cart-panel">
      <h2 className="cart-panel__title">Your Cart</h2>

      {success && (
        <div role="status" className="cart-panel__success">
          {success}
        </div>
      )}

      {error && (
        <div role="alert" className="cart-panel__error">
          {error}
        </div>
      )}

      {cart.length === 0 ? (
        <p className="cart-panel__empty">Your cart is empty.</p>
      ) : (
        <ul className="cart-panel__list">
          {cart.map(entry => (
            <li key={entry.menuItem.menuItemId} className="cart-panel__item">
              <div className="cart-panel__item-info">
                <span className="cart-panel__item-name">{entry.menuItem.name}</span>
                <span className="cart-panel__item-unit-price">
                  ${entry.menuItem.price.toFixed(2)} each
                </span>
              </div>
              <div className="cart-panel__item-controls">
                <label
                  htmlFor={`qty-${entry.menuItem.menuItemId}`}
                  className="cart-panel__qty-label"
                >
                  Qty:
                </label>
                <input
                  id={`qty-${entry.menuItem.menuItemId}`}
                  type="number"
                  min={1}
                  value={entry.quantity}
                  className="cart-panel__qty-input"
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      onUpdateQuantity(entry.menuItem.menuItemId, val);
                    }
                  }}
                  aria-label={`Quantity for ${entry.menuItem.name}`}
                />
                <span className="cart-panel__item-subtotal">
                  ${(entry.quantity * entry.menuItem.price).toFixed(2)}
                </span>
                <button
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

      <div className="cart-panel__footer">
        <span className="cart-panel__total">
          Total: <strong>${cartTotal.toFixed(2)}</strong>
        </span>
        <button
          className="cart-panel__place-order-btn"
          onClick={handlePlaceOrder}
          disabled={cart.length === 0}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
