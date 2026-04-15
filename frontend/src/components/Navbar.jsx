import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search } from 'lucide-react';

const Navbar = ({ cartCount }) => {
  const location = useLocation();

  return (
    <header className="navbar glass">
      <div className="container">
        <Link to="/" className="nav-brand">
          <ShoppingBag size={28} color="#6d28d9" />
          <span>Lumina</span>Store
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/cart" className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}>
            <div className="cart-icon">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
