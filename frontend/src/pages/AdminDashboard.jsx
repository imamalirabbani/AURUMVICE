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
        <div className="admin-welcome-card glass" style={{ marginBottom: '2rem', padding: '2.5rem', background: 'linear-gradient(135deg, #000 0%, #222 100%)', color: 'white' }}>
          <h1 style={{ color: '#C5A059', letterSpacing: '4px', marginBottom: '0.5rem' }}>DASHBOARD ADMIN</h1>
          <p style={{ opacity: 0.8, letterSpacing: '1px' }}>Selamat datang kembali, {user?.username || 'Administrator'}. Berikut ringkasan performa AURUMVICE.</p>
        </div>

        <div className="stats-grid">
          {statCards.map((stat, idx) => (
            <div key={idx} className="stat-card-premium" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {React.cloneElement(stat.icon, { size: 24 })}
              </div>
              <div className="stat-content">
                <span className="stat-label-lux">{stat.label}</span>
                <span className="stat-value-lux">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions-row">
          <div className="quick-actions-card glass">
            <h3>AKSI CEPAT</h3>
            <div className="action-buttons">
              <button className="btn-lux-action primary" onClick={() => window.location.href='/admin/orders'}>
                Lihat Semua Pesanan
              </button>
              <button className="btn-lux-action secondary" onClick={() => window.location.href='/admin/products'}>
                Manajemen Produk
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard {
          max-width: 100%;
          animation: fadeIn 0.8s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card-premium {
          background: white;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border: 1px solid #eee;
          transition: all 0.3s ease;
        }
        .stat-card-premium:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border-color: #ddd;
        }
        .stat-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-label-lux {
          font-size: 0.65rem;
          color: #888;
          letter-spacing: 2px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .stat-value-lux {
          font-size: 1.4rem;
          font-weight: 800;
          color: #111;
        }
        .quick-actions-row {
          display: grid;
          grid-template-columns: 1fr;
        }
        .quick-actions-card {
          padding: 2.5rem;
        }
        .quick-actions-card h3 {
          font-size: 1rem;
          letter-spacing: 3px;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 1rem;
        }
        .action-buttons {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .btn-lux-action {
          padding: 1rem 2rem;
          border: 1px solid #111;
          background: transparent;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-lux-action.primary {
          background: #111;
          color: white;
        }
        .btn-lux-action.primary:hover {
          background: #333;
          transform: translateY(-2px);
        }
        .btn-lux-action.secondary:hover {
          background: #f8f9fa;
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .admin-welcome-card {
            padding: 1.5rem !important;
          }
          .admin-welcome-card h1 {
            font-size: 1.2rem;
          }
          .admin-welcome-card p {
            font-size: 0.8rem;
          }
          .action-buttons {
            flex-direction: column;
          }
          .btn-lux-action {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard;
