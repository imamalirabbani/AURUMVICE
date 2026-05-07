import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts(search);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="home-container">
      <section className="brioni-hero">
        <img 
          src="/hero-brioni-new.png" 
          alt="AURUMVICE Collection" 
          className="brioni-hero-bg" 
        />
        <div className="brioni-hero-overlay">
          <h1 className="brioni-hero-title">SPRING / SUMMER 2026</h1>
          
          <div className="brioni-search-container">
            <div className="search-minimal">
              <input 
                type="text" 
                className="search-input hero-search-input" 
                placeholder="FIND YOUR PIECE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} className="search-icon-luxury" />
            </div>
          </div>

          <button 
            className="btn btn-primary brioni-hero-btn" 
            onClick={() => navigate('/about')}
          >
            DISCOVER MORE
          </button>
        </div>
      </section>

      <div className="collection-section">
        <div className="collection-header">
          <h2>COLLECTION</h2>
          <div className="collection-divider"></div>
        </div>

        {loading ? (
          <div className="empty-state">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">No products found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default Home;

