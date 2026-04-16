import { useNavigate } from 'react-router-dom';
import OrderHistory from './components/OrderHistory';
import '../styles/OrderHistoryPage.css';

export default function OrderHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="orders-page">
      <header className="orders-page__header">
        <button
          className="orders-page__back-btn"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
        >
          ← Dashboard
        </button>
        <span className="orders-page__logo">🍴 RestaurantOS</span>
      </header>

      <main className="orders-page__body">
        <OrderHistory />
      </main>
    </div>
  );
}
