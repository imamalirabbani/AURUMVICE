import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search } from 'lucide-react';

const Navbar = ({ cartCount, user, onLogout }) => {
  const location = useLocation();

  return (
    <header className="navbar-brioni">
      <div className="navbar-left">
        <Link to="/" className={`nav-link-brioni ${location.pathname === '/' ? 'active' : ''}`}>COLLECTION</Link>
        <Link to="/about" className={`nav-link-brioni ${location.pathname === '/about' ? 'active' : ''}`}>OUR STORY</Link>
      </div>

      <div className="navbar-center">
        <Link to="/" className="nav-brand-brioni">AURUMVICE</Link>
      </div>

      <div className="navbar-right">
        <Link to="/cart" className="nav-link-brioni">
          BAG {cartCount > 0 && <span>({cartCount})</span>}
        </Link>
        {user ? (
          <>
            <Link to="/pengaturan" className="nav-link-brioni">PENGATURAN</Link>
          </>
        ) : (
          <Link to="/login" className="nav-link-brioni">LOGIN</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
