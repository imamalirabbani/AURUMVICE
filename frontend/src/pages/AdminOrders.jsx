import React, { useState, useEffect } from 'react';
import { api, getImgUrl } from '../services/api';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Printer, MapPin, Send, Trash2 } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState({ tracking_number: '', shipping_courier: 'JNE' });
  const [newLog, setNewLog] = useState({ status_update: '', location: '' });
  const [feedbackMessage, setFeedbackMessage] = useState('Pembayaran Berhasil! Pesanan Anda sedang kami proses.');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      setTrackingInfo({
        tracking_number: selectedOrder.tracking_number || '',
        shipping_courier: selectedOrder.shipping_courier || 'JNE'
      });
    }
  }, [selectedOrder]);

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

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      await api.updatePaymentStatus(orderId, newStatus);
      
      // If approved, also add a tracking log with the selected feedback
      if (newStatus === 'Paid') {
        await api.addTrackingLog(orderId, {
          status_update: feedbackMessage,
          location: 'HQ AURUMVICE'
        });
      }

      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = await api.getOrder(orderId);
        setSelectedOrder(updated);
      }
      alert(`Status pembayaran berhasil diperbarui.`);
    } catch (err) {
      alert("Gagal update status pembayaran: " + err.message);
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

  const handlePaymentStatusUpdate = async (id, newStatus) => {
    try {
      await api.updatePaymentStatus(id, newStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        const updated = await api.getOrder(id);
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal update status pembayaran");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pesanan ini secara permanen?")) {
      try {
        await api.deleteOrder(orderId);
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(null);
        }
      } catch (err) {
        alert("Gagal menghapus pesanan: " + err.message);
      }
    }
  };

  const handleUpdateTrackingInfo = async () => {
    try {
      await api.updateTrackingInfo(selectedOrder.id, trackingInfo);
      alert("Info resi berhasil diperbarui");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTrackingLog = async () => {
    if (!newLog.status_update) return alert("Isi status update");
    try {
      await api.addTrackingLog(selectedOrder.id, newLog);
      setNewLog({ status_update: '', location: '' });
      const updated = await api.getOrder(selectedOrder.id);
      setSelectedOrder(updated);
      fetchOrders();
    } catch (err) {
      console.error(err);
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
                  <td data-label="ID">#{order.id.toString().padStart(6, '0')}</td>
                  <td data-label="PELANGGAN">
                    <div className="client-info-mini">
                      <strong>{order.client_name}</strong>
                      <span>{order.phone_number}</span>
                      {order.payment_proof_url && order.payment_status !== 'Paid' && (
                        <span className="badge-proof-alert pulse">BUKTI BARU</span>
                      )}
                    </div>
                  </td>
                  <td data-label="TOTAL">{formatPrice(order.total_amount)}</td>
                  <td data-label="STATUS">
                    <div className="status-stack">
                      <span className={`status-badge ${(order.status || 'Pending').toLowerCase()}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                      <span className={`status-badge mini ${(order.payment_status || 'Unpaid').toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.payment_status || 'Unpaid'}
                      </span>
                    </div>
                  </td>
                  <td data-label="TANGGAL">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                  <td data-label="AKSI">
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => setSelectedOrder(order)}>
                        <Eye size={18} />
                      </button>
                      <button className="btn-icon" style={{ color: '#e74c3c' }} onClick={() => handleDeleteOrder(order.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
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

              <div className="admin-order-detail-grid">
              <div className="detail-col">
                <h4>Informasi Pelanggan</h4>
                <p><strong>Nama:</strong> {selectedOrder.client_name}</p>
                <p><strong>Alamat:</strong> {selectedOrder.shipping_address}</p>
                <p><strong>PIC:</strong> {selectedOrder.pic_name}</p>
                <p><strong>Telp:</strong> {selectedOrder.phone_number}</p>
                <p><strong>Metode:</strong> {selectedOrder.payment_method}</p>
                <p><strong>Total:</strong> {formatPrice(selectedOrder.total_amount)}</p>
              </div>

              <div className="detail-col">
                <h4>Verifikasi Pembayaran</h4>
                <div className="payment-verification-box">
                  <p>Status: <span className={`status-badge mini ${selectedOrder.payment_status.toLowerCase().replace(/\s+/g, '-')}`}>{selectedOrder.payment_status}</span></p>
                  
                  {selectedOrder.payment_proof_url ? (
                    <div className="proof-preview-admin">
                      <p>Bukti Transfer:</p>
                      <a href={selectedOrder.payment_proof_url} target="_blank" rel="noreferrer">
                        <img src={getImgUrl(selectedOrder.payment_proof_url)} alt="Bukti Pembayaran" className="admin-proof-img" />
                      </a>
                      <div className="feedback-selector">
                        <label>Informasi untuk Client:</label>
                        <select 
                          value={feedbackMessage} 
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          className="lux-select-mini"
                        >
                          <option value="Pembayaran Berhasil! Pesanan Anda sedang kami proses.">Pembayaran Berhasil (Default)</option>
                          <option value="Pembayaran Diterima! Produk akan segera kami buatkan (Pre-Order).">Produk Akan Dibuatkan (Pre-Order)</option>
                          <option value="Pembayaran Sukses! Mohon tunggu, produk sedang disiapkan untuk pengiriman.">Sukses, Tunggu Pengiriman</option>
                        </select>
                      </div>

                      <div className="verify-actions">
                        <button 
                          className="btn-lux-small approve" 
                          onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'Paid')}
                        >
                          TERIMA & KIRIM NOTIF
                        </button>
                        <button 
                          className="btn-lux-small reject" 
                          onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'Failed')}
                        >
                          TOLAK
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="notif-empty">Belum ada bukti transfer diunggah.</div>
                  )}
                </div>
              </div>
            </div>

              <div className="detail-group">
                <label>Info Resi Pengiriman</label>
                <div className="tracking-info-form">
                  <input 
                    type="text" 
                    placeholder="Nomor Resi" 
                    value={trackingInfo.tracking_number}
                    onChange={(e) => setTrackingInfo({...trackingInfo, tracking_number: e.target.value})}
                  />
                  <select 
                    value={trackingInfo.shipping_courier}
                    onChange={(e) => setTrackingInfo({...trackingInfo, shipping_courier: e.target.value})}
                  >
                    <option value="JNE">JNE</option>
                    <option value="J&T">J&T</option>
                    <option value="SiCepat">SiCepat</option>
                    <option value="Anteraja">Anteraja</option>
                    <option value="Private Courier">Private Courier</option>
                  </select>
                  <button className="btn btn-secondary btn-sm" onClick={handleUpdateTrackingInfo}>Simpan</button>
                </div>
              </div>

              <div className="detail-group">
                <label>Update Lokasi / Status Paket</label>
                <div className="tracking-log-form">
                  <input 
                    type="text" 
                    placeholder="Status (Contoh: Paket keluar gudang)" 
                    value={newLog.status_update}
                    onChange={(e) => setNewLog({...newLog, status_update: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Lokasi (Contoh: Jakarta Pusat)" 
                    value={newLog.location}
                    onChange={(e) => setNewLog({...newLog, location: e.target.value})}
                  />
                  <button className="btn btn-primary btn-sm" onClick={handleAddTrackingLog}><Send size={14} /></button>
                </div>
                
                <div className="mini-timeline">
                  {selectedOrder.tracking_logs?.map((log, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="time">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      <div className="status">{log.status_update}</div>
                      <div className="loc">{log.location}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-group">
                <label>Alamat Pengiriman</label>
                <p>{selectedOrder.shipping_address}</p>
              </div>

              <div className="detail-group">
                <label>Daftar Barang</label>
                <div className="items-list">
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
