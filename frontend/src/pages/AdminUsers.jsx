import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Mail, MapPin, Calendar, Search, Trash2, ShieldCheck } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminUsers = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout user={user}>
      <div className="admin-users-page">
        <div className="admin-header glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>MANAJEMEN PELANGGAN</h1>
            <p>Kelola data dan akses pengguna AURUMVICE</p>
          </div>
          <div className="search-box-admin glass">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Memuat data pelanggan...</div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map(u => (
              <div key={u.id} className="user-card glass">
                <div className="user-card-header">
                  <div className="user-avatar-large">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-main-info">
                    <h3>{u.username}</h3>
                    <span className="user-id-badge">ID: #{u.id}</span>
                  </div>
                  {u.email === 'admin@aurumvice.com' && (
                    <div className="admin-badge-icon" title="Administrator">
                      <ShieldCheck size={20} color="#C5A059" />
                    </div>
                  )}
                </div>

                <div className="user-card-body">
                  <div className="user-info-row">
                    <Mail size={16} />
                    <span>{u.email}</span>
                  </div>
                  <div className="user-info-row">
                    <MapPin size={16} />
                    <span>{u.address || 'Alamat belum diatur'}</span>
                  </div>
                  <div className="user-info-row">
                    <Calendar size={16} />
                    <span>Bergabung: {new Date(u.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                <div className="user-card-footer">
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => alert("Fitur detail pelanggan segera hadir")}>
                    LIHAT RIWAYAT PESANAN
                  </button>
                  {u.email !== 'admin@aurumvice.com' && (
                    <button className="btn-icon danger" style={{ marginTop: '10px' }} title="Hapus Pengguna">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .search-box-admin {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 15px;
          background: white;
          border-radius: 8px;
        }
        .search-box-admin input {
          border: none;
          outline: none;
          font-size: 0.9rem;
          width: 200px;
        }
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .user-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: transform 0.3s;
        }
        .user-card:hover {
          transform: translateY(-5px);
        }
        .user-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
        }
        .user-avatar-large {
          width: 50px;
          height: 50px;
          background: #f0f0f0;
          color: var(--primary-color);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.5rem;
        }
        .user-main-info h3 {
          margin: 0;
          font-size: 1.1rem;
          text-transform: uppercase;
        }
        .user-id-badge {
          font-size: 0.7rem;
          color: #999;
        }
        .admin-badge-icon {
          position: absolute;
          right: 0;
          top: 0;
        }
        .user-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .user-card-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminUsers;
