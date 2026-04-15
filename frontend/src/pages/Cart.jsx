import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = ({ onUpdateCart }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3002/api/cart');
      const data = await res.json();
      setCartItems(data);
    } catch (err) {
      console.error("Failed to fetch cart items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const getImgUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:3002${url}`;
  };

  const handleRemove = async (cartId) => {
    try {
      await fetch(`http://localhost:3002/api/cart/${cartId}`, { method: 'DELETE' });
      await fetchCartItems();
      onUpdateCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      if (cartItems.length === 0) return;
      
      const confirmBuy = window.confirm(`Apakah Anda yakin ingin membeli ${cartItems.length} barang dengan total ${formatPrice(total)}?`);
      
      if (confirmBuy) {
        await fetch('http://localhost:3002/api/cart', { method: 'DELETE' });
        alert('Terima kasih! Pesanan Anda sedang diproses.');
        await fetchCartItems();
        onUpdateCart();
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Terjadi kesalahan saat checkout.");
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div className="empty-state">Loading cart...</div>;
  }

  return (
    <div className="glass" style={{ padding: '2rem', minHeight: '600px' }}>
      <div className="cart-header">
        <h1>Your Shopping Cart</h1>
        <span>{cartItems.length} Items</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h2 style={{ marginBottom: '1rem' }}>Your cart is empty</h2>
          <p style={{ marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item glass" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                <img src={getImgUrl(item.image)} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <div className="cart-item-price">{formatPrice(item.price)}</div>
                </div>
                
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <span style={{ padding: '0 10px', fontWeight: 'bold' }}>Qty: {item.quantity}</span>
                  </div>
                  
                  <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  
                  <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleRemove(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary glass" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="summary-total">
              <span>Total:</span>
              <span className="amount">{formatPrice(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
              <button className="btn btn-primary" onClick={handleCheckout} style={{ padding: '12px 30px', fontSize: '1.1rem' }}>
                Proceed to Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
