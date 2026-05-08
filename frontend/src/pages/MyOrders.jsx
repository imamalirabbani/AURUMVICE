import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Package, CheckCircle, Truck, XCircle, ArrowRight } from 'lucide-react';
import { api, getImgUrl } from '../services/api';

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
      case 'Pending': return <Clock size={14} />;
      case 'Diproses': return <Package size={14} />;
      case 'Dikirim': return <Truck size={14} />;
      case 'Selesai': return <CheckCircle size={14} />;
      case 'Cancel': return <XCircle size={14} />;
      default: return <Clock size={14} />;
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
          <div className="orders-stack-minimal">
            {orders.map((order) => (
              <div key={order.id} className="order-item-compact glass">
                <div className="order-compact-header">
                  <div className="order-meta-left">
                    <span className="order-id">#{order.id.toString().padStart(6, '0')}</span>
                    <span className="order-date">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="order-meta-right">
                    <span className={`status-tag ${(order.status || 'Pending').toLowerCase()}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-compact-body">
                  <div className="order-images-preview">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="preview-thumb-box" title={item.name}>
                        <img src={getImgUrl(item.image)} alt={item.name} className="preview-thumb" />
                        {item.quantity > 1 && <span className="thumb-qty">x{item.quantity}</span>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-compact-info">
                    <div className="order-items-summary">
                      {order.items?.length || 0} Produk dipesan
                    </div>
                    <div className="order-total-compact">
                      {formatPrice(order.total_amount)}
                    </div>
                  </div>
                </div>

                <div className="order-compact-footer">
                  <Link to={`/order-success/${order.id}`} className="btn-link-brioni">
                    LIHAT DETAIL <ArrowRight size={16} />
                  </Link>
                  {order.status === 'Pending' && (
                    <button 
                      className="btn-cancel-mini" 
                      onClick={async () => {
                        if (window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
                          try {
                            await api.cancelOrder(order.id);
                            window.location.reload();
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                    >
                      BATALKAN PESANAN
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders glass">
            <ShoppingBag size={48} opacity={0.3} />
            <p>Anda belum memiliki pesanan.</p>
            <Link to="/" className="btn-brioni">MULAI BELANJA</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
