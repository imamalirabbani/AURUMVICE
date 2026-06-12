import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import { HeartOff } from 'lucide-react';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await api.getWishlist();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await api.removeFromWishlist(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert("Gagal menghapus dari wishlist");
    }
  };

  if (loading) return <div className="empty-state">Loading your wishlist...</div>;

  return (
    <div className="wishlist-page animate-fadeIn">
      <div className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ letterSpacing: '8px', fontSize: '2.5rem', marginBottom: '1rem' }}>MY WISHLIST</h1>
        <p style={{ opacity: 0.6, letterSpacing: '2px' }}>Your curated selection of AURUMVICE pieces.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-wishlist" style={{ textAlign: 'center', padding: '5rem 0' }}>
          <HeartOff size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <p style={{ opacity: 0.5 }}>Belum ada produk di daftar keinginan Anda.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '2rem' }}
            onClick={() => window.location.href = '/'}
          >
            MULAI BELANJA
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {items.map(product => (
            <div key={product.id} className="wishlist-item-wrapper" style={{ position: 'relative' }}>
              <ProductCard product={product} />
              <button 
                onClick={() => removeFromWishlist(product.id)}
                style={{
                  position: 'absolute',
                  bottom: '120px',
                  right: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  zIndex: 20,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                title="Hapus dari wishlist"
              >
                <HeartOff size={16} color="#e74c3c" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
