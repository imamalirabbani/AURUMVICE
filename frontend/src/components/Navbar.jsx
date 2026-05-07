import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Search, Menu, X, Bell, User } from 'lucide-react';
import { api } from '../services/api';

const Navbar = ({ cartCount, user }) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const data = await api.getNotifications(user.id);
          setNotifications(data);
        } catch (err) {
          console.error("Failed to fetch notifications", err);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };
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
        {user && (
          <div className="nav-notification-wrapper">
            <button className="nav-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown glass">
                <div className="notif-header">
                  <span>NOTIFIKASI</span>
                  <button onClick={handleMarkAllRead}>Hapus Semua</button>
                </div>
                <div className="notif-list">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.is_read ? '' : 'unread'}`} onClick={() => handleMarkAsRead(n.id)}>
                        <p>{n.message}</p>
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))
                  ) : (
                    <div className="notif-empty">Tidak ada notifikasi</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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

