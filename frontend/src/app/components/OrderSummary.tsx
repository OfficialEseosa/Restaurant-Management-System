import { useState } from 'react';
import type { CartEntry } from '../../api/customerOrderApi';
import { placeOrder } from '../../api/customerOrderApi';
import '../../styles/OrderSummary.css';

interface OrderSummaryProps {
  cart: CartEntry[];
  onBack: () => void;
  onViewOrders: () => void;
  onBackToMenu: () => void;
}

type CheckoutState = 'review' | 'placing' | 'success' | 'error';

export default function OrderSummary({ cart, onBack, onViewOrders, onBackToMenu }: OrderSummaryProps) {
  const [state, setState] = useState<CheckoutState>('review');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subTotal = cart.reduce((sum, e) => sum + e.quantity * e.menuItem.price, 0);
  const tax = subTotal * 0.08;
  const serviceFee = cart.length > 0 ? 1.5 : 0;
  const orderTotal = subTotal + tax + serviceFee;

  const user = (() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem('user') || 'null');
      if (
        typeof parsed === 'object' && parsed !== null &&
        'userId' in parsed && typeof (parsed as { userId: unknown }).userId === 'number'
      ) {
        return parsed as { userId: number };
      }
      return null;
    } catch {
      return null;
    }
  })();

  async function handleConfirm() {
    if (!user) return;
    setState('placing');
    setErrorMsg(null);
    try {
      await placeOrder({
        userId: user.userId,
        items: cart.map(e => ({ menuItemId: e.menuItem.menuItemId, quantity: e.quantity })),
      });
      setState('success');
    } catch {
      setErrorMsg('Could not place your order. Please try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="order-summary order-summary--success">
        <div className="order-summary__success-wrap">
          <div className="order-summary__check-circle" aria-hidden="true">
            <svg className="order-summary__check-svg" viewBox="0 0 52 52" fill="none">
              <circle className="order-summary__check-ring" cx="26" cy="26" r="24" stroke="#e85d04" strokeWidth="3" fill="none" />
              <polyline className="order-summary__check-tick" points="14,27 22,35 38,18" stroke="#e85d04" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="order-summary__success-heading">Order Confirmed!</h2>
          <p className="order-summary__success-sub">Your order has been placed and is being prepared.</p>
          <div className="order-summary__success-actions">
            <button className="order-summary__btn order-summary__btn--primary" onClick={onViewOrders}>
              View My Orders
            </button>
            <button className="order-summary__btn order-summary__btn--ghost" onClick={onBackToMenu}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <div className="order-summary__header">
        <button className="order-summary__back-btn" onClick={onBack} aria-label="Back to cart">
          &#8592; Back to Cart
        </button>
        <h2 className="order-summary__title">Order Summary</h2>
      </div>

      <div className="order-summary__body">
        <ul className="order-summary__list">
          {cart.map(entry => (
            <li key={entry.menuItem.menuItemId} className="order-summary__line">
              {entry.menuItem.imageUrl && (
                <img
                  className="order-summary__line-img"
                  src={entry.menuItem.imageUrl}
                  alt={entry.menuItem.name}
                />
              )}
              <div className="order-summary__line-info">
                <span className="order-summary__line-name">{entry.menuItem.name}</span>
                <span className="order-summary__line-qty">x{entry.quantity}</span>
              </div>
              <span className="order-summary__line-price">
                ${(entry.quantity * entry.menuItem.price).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="order-summary__pricing">
          <div className="order-summary__pricing-row">
            <span>Subtotal</span>
            <span>${subTotal.toFixed(2)}</span>
          </div>
          <div className="order-summary__pricing-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="order-summary__pricing-row">
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="order-summary__pricing-row order-summary__pricing-row--total">
            <span>Total</span>
            <strong>${orderTotal.toFixed(2)}</strong>
          </div>
        </div>

        {state === 'error' && errorMsg && (
          <div role="alert" className="order-summary__error">{errorMsg}</div>
        )}

        <button
          className="order-summary__btn order-summary__btn--primary order-summary__confirm-btn"
          onClick={handleConfirm}
          disabled={state === 'placing' || cart.length === 0}
        >
          {state === 'placing' ? 'Placing Order...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}
