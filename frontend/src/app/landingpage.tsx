import { useNavigate } from 'react-router-dom'
import '../styles/landingpage.css'

function Landingpage() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <nav className="navbar">
        <span className="logo">RMS</span>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#features" className="nav-link">Features</a>
          <button className="nav-login-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Order your favorites,<br />skip the line.</h1>
          <p className="hero-sub">
            Browse the menu, customize your meal, and place your order — all from your device. Fast, easy, delicious.
          </p>
          <div className="hero-actions">
            <button className="cta-btn" onClick={() => navigate('/login?mode=signup')}>
              Create Account
            </button>
            <button className="cta-btn-outline" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up in seconds with just a username and password.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Browse the Menu</h3>
            <p>See what's available, check prices, and pick your favorites.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Place Your Order</h3>
            <p>Add items to your cart, confirm, and your order goes straight to the kitchen.</p>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <h2 className="section-title">Why RMS?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">&#9201;</div>
            <h3>Fast Ordering</h3>
            <p>No more waiting in line. Order from anywhere and pick up when it's ready.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#9776;</div>
            <h3>Full Menu Access</h3>
            <p>Browse the complete menu with real-time availability based on what's in stock.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#8635;</div>
            <h3>Order History</h3>
            <p>View your past orders and quickly reorder your go-to meals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">&#9733;</div>
            <h3>Simple &amp; Clean</h3>
            <p>A straightforward experience — no clutter, no confusion, just food.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-logo">RMS</span>
          <p>&copy; 2026 RMS. All rights reserved.</p>
          <button className="admin-link" onClick={() => navigate('/admin-login')}>
            Admin Portal
          </button>
        </div>
      </footer>
    </div>
  )
}

export default Landingpage
