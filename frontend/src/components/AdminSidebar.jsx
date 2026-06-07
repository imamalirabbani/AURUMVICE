import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const AdminSidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const orders = await api.getOrders();
        const pending = orders.filter(o => o.status === 'Pending' || o.payment_status === 'Pending Verification').length;
        setPendingCount(pending);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'DASHBOARD', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'PESANAN', path: '/admin/orders', icon: <ShoppingCart size={20} />, badge: pendingCount },
    { name: 'PRODUK', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'PELANGGAN', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'PENGATURAN', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="admin-sidebar glass">
      <div className="sidebar-header">
        <div className="admin-profile">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <span className="admin-name">{user?.username || 'ADMIN'}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon-box">{item.icon}</span>
            <span className="link-text">{item.name}</span>
            {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
            <ChevronRight size={16} className="arrow" />
          </Link>
        ))}
      </nav>

      <style>{`
        .sidebar-badge {
          background: #e74c3c;
          color: white;
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: auto;
          margin-right: 10px;
          font-weight: 700;
        }
      `}</style>

      <div className="sidebar-footer">
        <button 
          className="sidebar-link logout-btn-sidebar" 
          onClick={() => {
            if (window.confirm("Keluar dari dashboard admin?")) {
              if (onLogout) onLogout();
              window.location.href = '/';
            }
          }}
        >
          <LogOut size={20} />
          <span>KELUAR AKUN</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
