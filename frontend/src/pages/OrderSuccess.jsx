import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Printer, Home, ShoppingBag, Upload, CreditCard, Truck, MapPin } from 'lucide-react';
import { api } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await api.getOrder(id);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Silakan pilih file bukti transfer.");
    setUploading(true);
    try {
      await api.uploadPaymentProof(id, file);
      alert("Bukti transfer berhasil diunggah! Admin akan segera memverifikasi.");
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah bukti transfer.");
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="empty-state">Loading order details...</div>;
  if (!order) return <div className="empty-state">Order not found.</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="order-success-page">
      <div className="success-card glass">
        <div className="success-header">
          <CheckCircle size={64} className="success-icon" />
          <h1>Pesanan Berhasil!</h1>
          <p>Terima kasih atas kepercayaan Anda pada AURUMVICE.</p>
          <div className="order-number">Order ID: #{order.id.toString().padStart(6, '0')}</div>
          <div className={`payment-status-badge ${order.payment_status.toLowerCase().replace(/\s+/g, '-')}`}>
            {order.payment_status}
          </div>
        </div>

        <div className="payment-transfer-section glass no-print">
          <h3>Informasi Transfer Bank</h3>
          <div className="bank-info-card">
            <div className="bank-details">
              <div className="detail-row">
                <label>Bank</label>
                <span>BANK CENTRAL ASIA (BCA)</span>
              </div>
              <div className="detail-row">
                <label>No. Rekening</label>
                <span className="account-number">8820 991 223</span>
              </div>
              <div className="detail-row">
                <label>Atas Nama</label>
                <span>PT. AURUMVICE INDONESIA</span>
              </div>
              <div className="detail-row">
                <label>Jumlah Transfer</label>
                <span className="transfer-amount">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="payment-upload-form">
            <h4>Konfirmasi Pembayaran</h4>
            <p>Silakan unggah foto struk atau screenshot bukti transfer Anda.</p>
            
            {order.payment_proof_url ? (
              <div className="proof-status-success">
                <CheckCircle size={20} /> Bukti transfer telah diunggah
                <a href={order.payment_proof_url} target="_blank" rel="noreferrer" className="btn-link">Lihat Bukti</a>
              </div>
            ) : (
              <div className="upload-controls">
                <input type="file" onChange={handleFileChange} accept="image/*" id="proof-upload" />
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpload} 
                  disabled={uploading || !file}
                >
                  {uploading ? 'Mengunggah...' : <><Upload size={18} /> Unggah Bukti</>}
                </button>
              </div>
            )}
          </div>
        </div>

        {order.tracking_number && (
          <div className="package-tracking-section glass no-print">
            <h3>Lacak Paket</h3>
            <div className="tracking-info-header">
              <div className="courier-badge">
                <Truck size={18} /> {order.shipping_courier}
              </div>
              <div className="tracking-id">
                Resi: <strong>{order.tracking_number}</strong>
              </div>
            </div>

            <div className="tracking-timeline">
              {order.tracking_logs && order.tracking_logs.length > 0 ? (
                order.tracking_logs.map((log, index) => (
                  <div key={index} className="tracking-step">
                    <div className="step-marker">
                      <div className={`dot ${index === 0 ? 'pulse' : ''}`}></div>
                      {index < order.tracking_logs.length - 1 && <div className="line"></div>}
                    </div>
                    <div className="step-content">
                      <div className="step-time">{new Date(log.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}</div>
                      <div className="step-status">{log.status_update}</div>
                      {log.location && <div className="step-location"><MapPin size={12} /> {log.location}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="notif-empty">Menunggu update dari kurir...</div>
              )}
            </div>
          </div>
        )}

        <div className="invoice-container printable" id="invoice">
          <div className="invoice-header">
            <div className="brand">AURUMVICE</div>
            <div className="invoice-title">INVOICE</div>
          </div>

          <div className="invoice-details">
            <div className="billing-info">
              <h4>Ditagihkan ke:</h4>
              <p><strong>{order.client_name}</strong></p>
              <p>{order.shipping_address}</p>
              <p>PIC: {order.pic_name}</p>
              <p>Telp: {order.phone_number}</p>
            </div>
            <div className="order-info">
              <p>Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID')}</p>
              <p>Metode: {order.payment_method}</p>
              <p>Status: <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></p>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatPrice(item.price_at_purchase)}</td>
                  <td>{formatPrice(item.price_at_purchase * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right">Total</td>
                <td>{formatPrice(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>

          {order.notes && (
            <div className="invoice-notes">
              <h4>Catatan:</h4>
              <p>{order.notes}</p>
            </div>
          )}
        </div>

        <div className="success-actions no-print">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={18} /> Cetak Invoice
          </button>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Download size={18} /> Simpan PDF
          </button>
          <Link to="/" className="btn btn-primary">
            <ShoppingBag size={18} /> Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
