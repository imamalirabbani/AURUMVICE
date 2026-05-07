import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, Printer, Home, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrder();
  }, [id]);

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
        </div>

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
