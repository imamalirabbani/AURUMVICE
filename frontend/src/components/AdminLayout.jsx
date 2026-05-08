import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

const AdminLayout = ({ children, user, onLogout }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar user={user} onLogout={onLogout} />
      <div className="admin-body">
        <AdminTopBar user={user} />
        <main className="admin-main-view">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
