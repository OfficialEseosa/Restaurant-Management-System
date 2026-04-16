import { useNavigate } from 'react-router-dom';
import '../styles/CustomerDashboard.css';

export default function CustomerDashboard() {
  const navigate = useNavigate();

  // TODO (John): replace with real user from session/JWT auth
  let username = 'there';
  try {
    const stored = localStorage.getItem('user');
    if (stored) username = JSON.parse(stored).username ?? 'there';
  } catch { /* ignore */ }

  function handleLogout() {
    // TODO (John): clear auth token/session
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <div className="customer-dashboard">
      <header className="customer-dashboard__header">
        <span className="customer-dashboard__logo">🍴 RestaurantOS</span>
        <button className="customer-dashboard__logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="customer-dashboard__main">
        <h1 className="customer-dashboard__welcome">
          Welcome back, <span className="customer-dashboard__username">{username}</span>!
        </h1>
        <p className="customer-dashboard__sub">What would you like to do today?</p>

        <div className="customer-dashboard__cards">
          <button
            className="customer-dashboard__card"
            onClick={() => navigate('/menu')}
          >
            <span className="customer-dashboard__card-icon">🍽️</span>
            <h2 className="customer-dashboard__card-title">Browse Menu</h2>
            <p className="customer-dashboard__card-desc">See what's available and add items to your cart.</p>
          </button>

          <button
            className="customer-dashboard__card"
            onClick={() => navigate('/orders')}
          >
            <span className="customer-dashboard__card-icon">📋</span>
            <h2 className="customer-dashboard__card-title">My Orders</h2>
            <p className="customer-dashboard__card-desc">Review your past orders and their status.</p>
          </button>

          <button
            className="customer-dashboard__card customer-dashboard__card--placeholder"
            disabled
          >
            <span className="customer-dashboard__card-icon">👤</span>
            <h2 className="customer-dashboard__card-title">Account</h2>
            <p className="customer-dashboard__card-desc">Manage your profile and preferences.</p>
          </button>
        </div>
      </main>
    </div>
  );
}
