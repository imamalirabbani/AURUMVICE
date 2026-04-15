import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const navigate = useNavigate();

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

  const handleAddToCart = async (productId, isBuyNow = false) => {
    try {
      await fetch('http://localhost:3002/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      onAddToCart(); // Trigger update
      if (isBuyNow) {
        navigate('/cart');
      }
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  return (
    <div>
      <section className="hero glass">
        <h1>Discover Premium Products</h1>
        <p>Elevate your lifestyle with our curated collection of high-quality electronics, home goods, and fashion accessories.</p>
        
        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
          <div className="input-group">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <Search style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-secondary)' }} size={20} />
          </div>
        </div>
      </section>

      <div className="mb-2">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Featured Products</h2>
        {loading ? (
          <div className="empty-state">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
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
