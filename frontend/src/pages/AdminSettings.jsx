import React from 'react';
import AdminLayout from '../components/AdminLayout';

const AdminSettings = ({ user }) => {
  return (
    <AdminLayout user={user}>
      <div className="admin-header glass">
        <h1>PENGATURAN ADMIN</h1>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
