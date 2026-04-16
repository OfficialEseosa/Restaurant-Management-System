import { useNavigate } from 'react-router-dom';
import '../styles/landingpage.css';

const FEATURES = [
  { icon: '🛒', title: 'Customer Ordering',    desc: 'Browse the menu, add items to a cart, and place orders with ease.' },
  { icon: '📋', title: 'Order Management',     desc: 'Track and manage incoming orders from a central dashboard.' },
  { icon: '🍽️', title: 'Menu Control',         desc: 'Create, edit, and deactivate menu items with ingredient assignments.' },
  { icon: '📦', title: 'Inventory Tracking',   desc: 'Monitor ingredient stock levels and log every adjustment.' },
  { icon: '👤', title: 'Staff Management',     desc: 'Manage admin accounts and control access to the system.' },
  { icon: '📊', title: 'Analytics',            desc: 'View order history and usage trends to inform decisions.' },
];

export default function Landingpage() {
  const navigate = useNavigate();

  return (
    <div className="page">

      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="logo">🍴 RestaurantOS</span>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#about"    className="nav-link">About</a>
          <button className="nav-login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <h1 className="hero-title">Manage Your Restaurant,<br />All in One Place.</h1>
        <p className="hero-sub">
          Streamline orders, inventory, and menu management — built for small restaurants that want to move fast.
        </p>
        <button className="cta-btn" onClick={() => navigate('/login')}>
          Get Started
        </button>
      </section>

      {/* ── About ── */}
      <section id="about" className="statement">
        <h2 className="sub-title">Who We Serve</h2>
        <p className="paragraph">
          RestaurantOS is a full-stack management system designed for small, single-owner restaurants.
          Customers can browse the menu, check ingredient-based availability, place orders, and review
          their history. Administrators manage ingredients, menu items, inventory, and can view order
          analytics — all from one dashboard.
        </p>
      </section>

      {/* ── Features ── */}
      <section id="features" className="features">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <span className="card-icon">{f.icon}</span>
            <h3 className="card-title">{f.title}</h3>
            <p className="card-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <h2 className="cta-banner__title">Ready to get started?</h2>
        <p className="cta-banner__sub">Sign in and take control of your restaurant today.</p>
        <button className="cta-btn" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>© 2026 RestaurantOS. All rights reserved.</p>
      </footer>

    </div>
  );
}
