import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { api, IMAGE_BASE_URL, getImgUrl } from '../services/api';

const ProductDetail = ({ onAddToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleAddToCart = async (isBuyNow = false) => {
    try {
      await api.addToCart(product.id, quantity);
      onAddToCart();
      if (isBuyNow) navigate('/cart');
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  if (loading) return <div className="empty-state">Loading product details...</div>;
  if (!product) return <div className="empty-state">Product not found.</div>;

  // Consolidate images: main image + gallery images
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Products
      </button>

      <div className="detail-grid">
        <div className="detail-gallery">
          <div className="main-image-container">
            <img 
              src={getImgUrl(allImages[activeImage])} 
              alt={product.name} 
              className="detail-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x1000?text=Image+Unavailable';
              }} 
            />
          </div>
          {allImages.length > 1 && (
            <div className="thumbnail-strip">
              {allImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail-item ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={getImgUrl(img)} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x125?text=NA';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <span className="product-category-luxury">{product.category?.toUpperCase()}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-price">{formatPrice(product.price)}</div>
          
          <p className="detail-desc">{product.description}</p>

          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            
            <button className="btn btn-secondary" onClick={() => handleAddToCart(false)}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="btn btn-primary" onClick={() => handleAddToCart(true)}>
              Buy Now
            </button>
          </div>

          <div className="detail-benefits">
            <div className="benefit-item">
              <Truck size={20} />
              <div>
                <strong>Free Shipping</strong>
                <p>On orders over Rp 5.000.000</p>
              </div>
            </div>
            <div className="benefit-item">
              <Shield size={20} />
              <div>
                <strong>2 Year Warranty</strong>
                <p>Full coverage for manufacturing defects</p>
              </div>
            </div>
            <div className="benefit-item">
              <RefreshCw size={20} />
              <div>
                <strong>30-Day Returns</strong>
                <p>Easy returns if you're not satisfied</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

