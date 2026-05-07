import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search, Menu, X } from 'lucide-react';

const Navbar = ({ cartCount, user }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="navbar-brioni">
      <button className="mobile-menu-btn" onClick={toggleMenu}>
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar-left ${isMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/" onClick={() => setIsMenuOpen(false)} className={`nav-link-brioni ${location.pathname === '/' ? 'active' : ''}`}>COLLECTION</Link>
        <Link to="/about" onClick={() => setIsMenuOpen(false)} className={`nav-link-brioni ${location.pathname === '/about' ? 'active' : ''}`}>OUR STORY</Link>
        {isMenuOpen && (
          <>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="nav-link-brioni">BAG ({cartCount})</Link>
            {user ? (
              <Link to="/pengaturan" onClick={() => setIsMenuOpen(false)} className="nav-link-brioni">PENGATURAN</Link>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="nav-link-brioni">LOGIN</Link>
            )}
          </>
        )}
      </div>

      <div className="navbar-center">
        <Link to="/" className="nav-brand-brioni">AURUMVICE</Link>
      </div>

      <div className="navbar-right desktop-only">
        <Link to="/cart" className="nav-link-brioni">
          BAG {cartCount > 0 && <span>({cartCount})</span>}
        </Link>
        {user ? (
          <Link to="/pengaturan" className="nav-link-brioni">PENGATURAN</Link>
        ) : (
          <Link to="/login" className="nav-link-brioni">LOGIN</Link>
        )}
      </div>

      {isMenuOpen && <div className="mobile-overlay" onClick={toggleMenu}></div>}
    </header>
  );
};

export default Navbar;

