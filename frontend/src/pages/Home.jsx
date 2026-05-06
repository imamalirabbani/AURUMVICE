import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`http://localhost:3002/api/products${query}`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search]);

  const navigate = useNavigate();

  return (
    <div>
      <section className="brioni-hero">
        <img src="/hero-brioni-new.png" alt="AURUMVICE Collection" className="brioni-hero-bg" style={{ filter: 'brightness(0.6)' }} />
        <div className="brioni-hero-overlay">
          <h1 className="brioni-hero-title">SPRING / SUMMER 2026</h1>
          <div className="search-minimal brioni-search" style={{ marginTop: '2rem', width: '100%', maxWidth: '400px' }}>
            <input 
              type="text" 
              className="search-input" 
              style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.5)', padding: '10px 40px 10px 0', fontSize: '0.9rem' }}
              placeholder="FIND YOUR PIECE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} className="search-icon-luxury" style={{ color: 'white' }} />
          </div>
          <button className="btn btn-primary brioni-hero-btn" style={{ marginTop: '2rem' }} onClick={() => navigate('/about')}>DISCOVER MORE</button>
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
              <ProductCard 
                key={product.id} 
                product={product} 
              />
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
