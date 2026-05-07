import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children, user }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar user={user} />
      <main className="admin-main-view">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
