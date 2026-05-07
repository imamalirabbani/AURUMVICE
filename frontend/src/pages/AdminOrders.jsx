import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Printer } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.updateOrderStatus(id, newStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        const updated = await api.getOrder(id);
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal update status");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={16} />;
      case 'diproses': return <Clock size={16} style={{ color: '#f39c12' }} />;
      case 'dikirim': return <Truck size={16} style={{ color: '#3498db' }} />;
      case 'selesai': return <CheckCircle size={16} style={{ color: '#27ae60' }} />;
      case 'cancel': return <XCircle size={16} style={{ color: '#e74c3c' }} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) return <div className="empty-state">Loading orders...</div>;

  return (
    <div className="admin-orders-page">
      <div className="admin-header glass">
        <h1>MANAJEMEN PESANAN</h1>
        <p>Kelola dan pantau semua pesanan masuk</p>
      </div>

      <div className="admin-grid">
        <div className="orders-list-section glass">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected' : ''}>
                  <td>#{order.id.toString().padStart(4, '0')}</td>
                  <td>{order.client_name}</td>
                  <td>{formatPrice(order.total_amount)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <button className="btn-icon" onClick={() => setSelectedOrder(order)}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="order-details-section glass">
          {selectedOrder ? (
            <div className="detail-view">
              <div className="detail-header">
                <h3>Detail Pesanan #{selectedOrder.id}</h3>
                <div className="detail-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => window.open(`/order-success/${selectedOrder.id}`, '_blank')}>
                    <Printer size={16} /> Invoice
                  </button>
                </div>
              </div>

              <div className="detail-group">
                <label>Status Pesanan</label>
                <div className="status-updater">
                  {['Pending', 'Diproses', 'Dikirim', 'Selesai', 'Cancel'].map(s => (
                    <button 
                      key={s} 
                      className={`btn-status ${selectedOrder.status === s ? 'active' : ''}`}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>Client</label>
                  <span>{selectedOrder.client_name}</span>
                </div>
                <div className="info-item">
                  <label>PIC</label>
                  <span>{selectedOrder.pic_name}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{selectedOrder.phone_number}</span>
                </div>
                <div className="info-item">
                  <label>Payment</label>
                  <span>{selectedOrder.payment_method}</span>
                </div>
              </div>

              <div className="address-item">
                <label>Alamat Pengiriman</label>
                <p>{selectedOrder.shipping_address}</p>
              </div>

              <div className="items-list">
                <label>Daftar Barang</label>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                  </div>
                ))}
                <div className="order-total-row">
                  <span>TOTAL</span>
                  <span>{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <Package size={48} />
              <p>Pilih pesanan untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
