import React from 'react';
import AdminLayout from '../components/AdminLayout';

const AdminUsers = ({ user }) => {
  return (
    <AdminLayout user={user}>
      <div className="admin-header glass">
        <h1>MANAJEMEN PELANGGAN</h1>
        <p>Fitur ini sedang dalam pengembangan.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
