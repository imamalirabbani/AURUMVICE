import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Users, DollarSign, TrendingUp, Package } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orders = await api.getOrders();
        const products = await api.getProducts();
        
        const totalRevenue = orders
          .filter(o => o.payment_status === 'Paid')
          .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
          
        const pendingPayments = orders.filter(o => o.payment_status === 'Pending Verification').length;

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          pendingPayments
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const statCards = [
    { label: 'TOTAL PESANAN', value: stats.totalOrders, icon: <ShoppingBag />, color: '#3498db' },
    { label: 'TOTAL PENDAPATAN', value: formatPrice(stats.totalRevenue), icon: <DollarSign />, color: '#27ae60' },
    { label: 'TOTAL PRODUK', value: stats.totalProducts, icon: <Package />, color: '#9b59b6' },
    { label: 'VERIFIKASI PENDING', value: stats.pendingPayments, icon: <TrendingUp />, color: '#e67e22' },
  ];

  return (
    <AdminLayout user={user}>
      <div className="admin-dashboard">
        <div className="admin-header glass" style={{ marginBottom: '2rem' }}>
          <h1>DASHBOARD ADMIN</h1>
          <p>Ringkasan performa AURUMVICE</p>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className="stat-card glass" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <div className="stat-icon" style={{ color: stat.color }}>{stat.icon}</div>
              <div className="stat-details">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions glass" style={{ marginTop: '2rem', padding: '2rem' }}>
          <h3>AKSI CEPAT</h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => window.location.href='/admin/orders'}>Lihat Semua Pesanan</button>
            <button className="btn btn-secondary">Tambah Produk Baru</button>
          </div>
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .stat-icon {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-details {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
          font-weight: 600;
        }
        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard;
