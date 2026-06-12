import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Users, DollarSign, TrendingUp, Package } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    daily_stats: [],
    top_products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const statCards = [
    { label: 'TOTAL PESANAN', value: stats.total_orders, icon: <ShoppingBag />, color: '#3498db' },
    { label: 'TOTAL PENDAPATAN', value: formatPrice(stats.total_revenue), icon: <DollarSign />, color: '#27ae60' },
    { label: 'TOTAL PRODUK', value: stats.total_products, icon: <Package />, color: '#9b59b6' },
    { label: 'TOTAL USERS', value: stats.total_users, icon: <Users />, color: '#e67e22' },
  ];

  if (loading) return <AdminLayout user={user} onLogout={onLogout}>Loading dashboard...</AdminLayout>;

  return (
    <AdminLayout user={user} onLogout={onLogout}>
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

        <div className="dashboard-grid-secondary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="analytics-card glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>TOP SELLING PRODUCTS</h3>
            <div className="top-products-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {stats.top_products.map((p, i) => (
                <div key={i} className="top-product-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span>{p.name}</span>
                    <strong>{p.total_sold} units</strong>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '6px', background: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div className="progress-bar-fill" style={{ 
                      height: '100%', 
                      background: 'var(--accent-gold)', 
                      width: `${(p.total_sold / Math.max(...stats.top_products.map(x => x.total_sold))) * 100}%`,
                      transition: 'width 1s ease-out'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>WEEKLY REVENUE</h3>
            <div className="daily-stats-chart" style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              {stats.daily_stats.map((d, i) => (
                <div key={i} className="chart-bar-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="chart-bar" style={{ 
                    width: '100%', 
                    background: '#111', 
                    borderRadius: '4px 4px 0 0',
                    height: `${(d.revenue / (Math.max(...stats.daily_stats.map(x => x.revenue)) || 1)) * 100}%`,
                    minHeight: '2px',
                    transition: 'height 1s ease-out'
                  }} title={formatPrice(d.revenue)}></div>
                  <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{new Date(d.date).toLocaleDateString([], { weekday: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
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
              <button className="btn-lux-action logout" onClick={() => {
                if(window.confirm("Keluar dari dashboard admin?")) {
                  if(onLogout) onLogout();
                  window.location.href='/';
                }
              }}>
                Keluar Dashboard
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
        .btn-lux-action.logout {
          background: #333;
          color: white;
          border: 1px solid #444;
        }
        .btn-lux-action.logout:hover {
          background: #e74c3c;
          border-color: #e74c3c;
          color: white;
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
