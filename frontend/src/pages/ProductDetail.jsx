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
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.getProduct(id);
        setProduct(data);
        // Fetch reviews
        const reviewData = await api.getReviews(id);
        setReviews(reviewData);
      } catch (err) {
        console.error("Failed to fetch product data:", err);
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
    // Cek apakah user sudah login
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk menambah ke keranjang");
      navigate('/login');
      return;
    }
    try {
      await api.addToCart(product.id, quantity);
      onAddToCart();
      if (isBuyNow) navigate('/cart');
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createReview({
        product_id: product.id,
        ...newReview
      });
      alert("Terima kasih atas ulasan Anda!");
      setNewReview({ rating: 5, comment: '' });
      // Refresh reviews
      const reviewData = await api.getReviews(id);
      setReviews(reviewData);
    } catch (err) {
      alert(err.response?.data?.error || "Gagal mengirim ulasan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-wrapper" style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={14} 
            fill={star <= rating ? "#C5A059" : "none"} 
            stroke={star <= rating ? "#C5A059" : "#ccc"} 
          />
        ))}
      </div>
    );
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
          
          <div className="detail-stock" style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: product.stock > 0 ? '#27ae60' : '#e74c3c' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: product.stock > 0 ? '#27ae60' : '#e74c3c' }}>
              {product.stock > 0 ? `Stock: ${product.stock} available` : 'Currently Out of Stock'}
            </span>
          </div>
          
          <p className="detail-desc">{product.description}</p>

          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={product.stock <= 0}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={product.stock <= 0}>+</button>
            </div>
            
            <button className="btn btn-secondary" onClick={() => handleAddToCart(false)} disabled={product.stock <= 0}>
              <ShoppingCart size={18} /> {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="btn btn-primary" onClick={() => handleAddToCart(true)} disabled={product.stock <= 0}>
              {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
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

      {/* --- Reviews Section --- */}
      <div className="reviews-section glass" style={{ marginTop: '4rem', padding: '3rem' }}>
        <h2 style={{ letterSpacing: '4px', marginBottom: '2rem' }}>CUSTOMER REVIEWS</h2>
        
        <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: reviews.length > 0 ? '1fr 1fr' : '1fr', gap: '3rem' }}>
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Belum ada ulasan untuk produk ini.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {reviews.map(review => (
                  <div key={review.id} className="review-item" style={{ borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>{review.username}</strong>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {renderStars(review.rating)}
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', lineHeight: '1.6', opacity: 0.8 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="add-review-form">
            <h3 style={{ fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>BERIKAN ULASAN ANDA</h3>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>RATING</label>
                <select 
                  value={newReview.rating} 
                  onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  style={{ padding: '0.5rem', border: '1px solid #ddd' }}
                >
                  <option value="5">5 Bintang - Sempurna</option>
                  <option value="4">4 Bintang - Sangat Baik</option>
                  <option value="3">3 Bintang - Cukup</option>
                  <option value="2">2 Bintang - Kurang</option>
                  <option value="1">1 Bintang - Buruk</option>
                </select>
              </div>
              <div className="input-group">
                <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>KOMENTAR</label>
                <textarea 
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  required
                  rows="4"
                  placeholder="Ceritakan pengalaman Anda menggunakan produk ini..."
                  style={{ padding: '1rem', border: '1px solid #ddd', fontFamily: 'inherit' }}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
                style={{ alignSelf: 'flex-start', padding: '1rem 2rem' }}
              >
                {isSubmitting ? 'MENGIRIM...' : 'KIRIM ULASAN'}
              </button>
              <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.5rem' }}>* Anda hanya dapat memberikan ulasan jika sudah membeli produk ini.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

