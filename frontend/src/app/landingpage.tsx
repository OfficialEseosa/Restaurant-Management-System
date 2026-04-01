import '../styles/landingpage.css'

function Landingpage() {
  return (
    <div className="page">
      <nav className="navbar">
        <span className="logo">*Placeholder Name*</span>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <a href='/login'>
            <button className="login-btn">Login</button>
          </a>
        </div>
      </nav>

      <section className="hero">
        <h1 className="hero-title">Manage Your Restaurant With Us!</h1>
        <p className="hero-sub">
          Let customers order, and streamline orders, inventory, menu management, and staff — all from one dashboard.
        </p>
        <a href='/login'>
          <button className="cta-btn">Get Started</button>
        </a>
      </section>

      <section className='statement'>
        <h2 className='sub-title'>
          Who We Serve
        </h2>
            <p className='paragraph'>
            This project is a database-driven restaurant management system designed for a small, single-owner restaurant. The system supports two types of users: customers and administrators. Customers can browse the restaurant’s menu, view item availability based on ingredient stock levels, place orders using a cart-based flow, and review their previous orders. Administrators can manage ingredients and menu items, update inventory quantities, upload images for ingredients and menu items, and view analytics related to customer orders. 
            </p>
      </section>

      <section id="features" className="features">
        {[
          { icon: '🛒', title: 'Customer Use', desc: 'Desc.' },
          { icon: '📋', title: 'Order Management', desc: 'Desc.' },
          { icon: '🍽️', title: 'Menu Control', desc: 'Desc.' },
          { icon: '📦', title: 'Inventory Tracking', desc: 'Desc.' },
          { icon: '👤', title: 'Staff Management', desc: 'Desc.' },
          { icon: '📊', title: 'Analytics', desc: 'Desc.' },
        ].map((f) => (
          <div key={f.title} className="card">
            <span className="card-icon">{f.icon}</span>
            <h3 className="card-title">{f.title}</h3>
            <p className="card-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="footer">
        <p>© 2026 *Placeholder Name*. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Landingpage
