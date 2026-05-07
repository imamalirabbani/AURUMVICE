import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Package, CheckCircle, Truck, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const MyOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const data = await api.getUserOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch user orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Diproses': return <Package size={16} />;
      case 'Dikirim': return <Truck size={16} />;
      case 'Selesai': return <CheckCircle size={16} />;
      case 'Cancel': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  if (loading) return <div className="loading-brioni">LOADING...</div>;

  return (
    <div className="my-orders-page">
      <div className="container-brioni">
        <h1 className="page-title-brioni">PESANAN SAYA</h1>
        <p className="page-subtitle">Pantau status dan riwayat pembelanjaan Anda</p>

        {orders.length > 0 ? (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card-luxury glass">
                <div className="order-card-header">
                  <div className="order-id">#{order.id.toString().padStart(6, '0')}</div>
                  <div className="order-date">{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>

                <div className="order-card-body">
                  <div className="order-main-info">
                    <div className="info-item">
                      <label>TOTAL</label>
                      <span className="price">{formatPrice(order.total_amount)}</span>
                    </div>
                    <div className="info-item">
                      <label>STATUS</label>
                      <span className={`status-badge ${(order.status || 'Pending').toLowerCase()}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>PEMBAYARAN</label>
                      <span className={`status-badge mini ${(order.payment_status || 'Unpaid').toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.payment_status || 'Unpaid'}
                      </span>
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="order-tracking-info">
                      <Truck size={14} /> <span>{order.shipping_courier}: {order.tracking_number}</span>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <Link to={`/order-success/${order.id}`} className="btn-link-brioni">
                    LIHAT DETAIL <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders">
            <ShoppingBag size={48} />
            <h2>Belum ada pesanan</h2>
            <p>Anda belum melakukan transaksi apapun di AURUMVICE.</p>
            <Link to="/" className="btn btn-primary">MULAI BELANJA</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
