import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShieldCheck, Truck, CreditCard, ChevronRight } from 'lucide-react';

const Checkout = ({ user, onOrderComplete }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_name: user?.username || '',
    shipping_address: user?.address || '',
    pic_name: '',
    phone_number: '',
    notes: '',
    payment_method: 'Transfer Bank'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await api.getCart();
        if (data.length === 0) {
          navigate('/cart');
          return;
        }
        setCartItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        user_id: user?.id || null,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: total
      };

      const result = await api.createOrder(orderData);
      onOrderComplete(); // Refresh cart count in App
      navigate(`/order-success/${result.id}`);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Gagal memproses pesanan. Silakan coba lagi.";
      alert(errorMsg);
    }
  };

  if (loading) return <div className="empty-state">Loading checkout...</div>;

  return (
    <div className="checkout-page">
      <div className="checkout-container glass">
        <h1 className="checkout-title">CHECKOUT</h1>
        
        <form onSubmit={handleSubmit} className="checkout-grid">
          <div className="checkout-form-section">
            <h3 className="section-title">Informasi Pengiriman</h3>
            
            <div className="form-group-luxury">
              <label>Nama Perusahaan / Client</label>
              <input 
                type="text" 
                name="client_name" 
                value={formData.client_name} 
                onChange={handleChange} 
                required 
                placeholder="Contoh: PT. Maju Bersama"
              />
            </div>

            <div className="form-group-luxury">
              <label>Alamat Lengkap Pengiriman</label>
              <textarea 
                name="shipping_address" 
                value={formData.shipping_address} 
                onChange={handleChange} 
                required 
                placeholder="Jalan, No. Rumah, Kecamatan, Kota, Kode Pos"
              />
            </div>

            <div className="form-row">
              <div className="form-group-luxury">
                <label>Person In Charge (PIC)</label>
                <input 
                  type="text" 
                  name="pic_name" 
                  value={formData.pic_name} 
                  onChange={handleChange} 
                  required 
                  placeholder="Nama penerima"
                />
              </div>
              <div className="form-group-luxury">
                <label>No. HP / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone_number" 
                  value={formData.phone_number} 
                  onChange={handleChange} 
                  required 
                  placeholder="0812xxxx"
                />
              </div>
            </div>

            <div className="form-group-luxury">
              <label>Catatan Pembelian (Opsional)</label>
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                placeholder="Instruksi khusus untuk pengiriman..."
              />
            </div>

            <h3 className="section-title" style={{ marginTop: '2rem' }}>Metode Pembayaran</h3>
            <div className="payment-options">
              {['Transfer Bank', 'E-Wallet', 'Corporate Billing'].map(method => (
                <label key={method} className={`payment-card ${formData.payment_method === method ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value={method} 
                    checked={formData.payment_method === method} 
                    onChange={handleChange}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="checkout-summary-section">
            <div className="order-summary-card">
              <h3 className="summary-title">Ringkasan Pesanan</h3>
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span>Total Pembayaran</span>
                <span className="total-amount">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}
                </span>
              </div>

              <button type="submit" className="btn btn-primary checkout-submit-btn">
                PESAN SEKARANG <ChevronRight size={20} />
              </button>

              <div className="checkout-guarantee">
                <div className="guarantee-item">
                  <ShieldCheck size={16} /> Secure Transaction
                </div>
                <div className="guarantee-item">
                  <Truck size={16} /> Premium Delivery
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
