import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, ChevronRight } from 'lucide-react';

const AdminSidebar = ({ user }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'DASHBOARD', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'PESANAN', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
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
            <ChevronRight size={16} className="arrow" />
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-link logout">
          <LogOut size={20} />
          <span>KELUAR ADMIN</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
