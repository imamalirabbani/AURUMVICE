import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImgUrl, api } from '../services/api';
import { Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert("Silakan login untuk fitur wishlist");
    setLoading(true);
    try {
      await api.addToWishlist(product.id);
      alert("Produk ditambahkan ke wishlist");
    } catch (err) {
      alert("Gagal menambahkan ke wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-card-luxury">
      <Link to={`/product/${product.id}`} className="product-image-link" aria-label={`Detail produk ${product.name}`}>
        <div className="product-image-wrapper">
          <img 
            src={getImgUrl(product.image)} 
            alt={product.name} 
            className="product-image" 
            loading="lazy"
            width="400"
            height="500"
          />
          <div className="product-overlay">
            <span>EXPLORE PIECE</span>
          </div>
          <button 
            className="wishlist-btn-overlay" 
            onClick={handleWishlist}
            disabled={loading}
            style={{ 
              position: 'absolute', 
              top: '15px', 
              right: '15px', 
              background: 'white', 
              border: 'none', 
              borderRadius: '50%', 
              width: '35px', 
              height: '35px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <Heart size={18} color={loading ? "#ccc" : "#C5A059"} fill={loading ? "none" : "none"} />
          </button>
        </div>
      </Link>
      
      <div className="product-info-luxury">
        <div className="product-category-luxury">{product.category?.toUpperCase()}</div>
        <h3 className="product-name-luxury">{product.name}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="product-price-luxury">{formatPrice(product.price)}</p>
          {product.stock <= 0 && <span style={{ color: '#e74c3c', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>SOLD OUT</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
