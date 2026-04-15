import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CartPage from './pages/Cart';
import './index.css';

function App() {
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/cart');
      const data = await res.json();
      const count = data.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <Router>
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <Navbar cartCount={cartCount} />
      <main className="main-content container">
        <Routes>
          <Route path="/" element={<Home onAddToCart={fetchCart} />} />
          <Route path="/cart" element={<CartPage onUpdateCart={fetchCart} />} />
        </Routes>
      </main>
      <footer>
        <p>&copy; 2026 Web Jual Beli Premium. All rights reserved.</p>
      </footer>
    </Router>
  );
}

export default App;
