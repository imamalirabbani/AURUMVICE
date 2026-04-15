import React from 'react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const getImgUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:3002${url}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="product-card glass">
      <img src={getImgUrl(product.image)} alt={product.name} className="product-image" />
      <span className="product-category">{product.category}</span>
      <h3 className="product-title">{product.name}</h3>
      <p className="product-desc">{product.description}</p>

      <div className="product-footer" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <span className="product-price" style={{ width: '100%', marginBottom: '5px' }}>{formatPrice(product.price)}</span>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => onAddToCart(product.id, false)}>
          <ShoppingCart size={18} />
          + Keranjang
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onAddToCart(product.id, true)}>
          Beli Sekarang
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
