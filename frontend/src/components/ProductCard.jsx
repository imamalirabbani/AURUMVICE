import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../services/api';

const ProductCard = ({ product }) => {
  const getImgUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
    
    // Fix malformed URLs like "https//..." (missing colon)
    let cleanUrl = url;
    if (url.startsWith('https//')) {
      cleanUrl = url.replace('https//', 'https://');
    } else if (url.startsWith('http//')) {
      cleanUrl = url.replace('http//', 'http://');
    }

    if (cleanUrl.startsWith('http')) return cleanUrl;
    
    // Ensure relative paths start with /
    const separator = cleanUrl.startsWith('/') ? '' : '/';
    return `${IMAGE_BASE_URL}${separator}${cleanUrl}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="product-card-luxury">
      <Link to={`/product/${product.id}`} className="product-image-link">
        <div className="product-image-wrapper">
          <img src={getImgUrl(product.image)} alt={product.name} className="product-image" />
          <div className="product-overlay">
            <span>EXPLORE PIECE</span>
          </div>
        </div>
      </Link>
      
      <div className="product-info-luxury">
        <div className="product-category-luxury">{product.category?.toUpperCase()}</div>
        <h3 className="product-name-luxury">{product.name}</h3>
        <p className="product-price-luxury">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
