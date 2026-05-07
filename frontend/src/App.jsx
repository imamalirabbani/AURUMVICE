import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import IntroAnimation from './components/IntroAnimation';
import Home from './pages/Home';
import About from './pages/About';
import CartPage from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Pengaturan from './pages/Pengaturan';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminOrders from './pages/AdminOrders';
import { api } from './services/api';
import './index.css';

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await api.getCart();
      const count = data.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      await fetchCart();
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    initializeApp();
  }, [fetchCart]);


  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <ScrollToTop />
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      <Navbar cartCount={cartCount} user={user} />
      <main className="main-content container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<CartPage onUpdateCart={fetchCart} />} />
          <Route path="/product/:id" element={<ProductDetail onAddToCart={fetchCart} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pengaturan" element={<Pengaturan user={user} onLogout={handleLogout} onUpdateUser={setUser} />} />
          <Route path="/checkout" element={<Checkout user={user} onOrderComplete={fetchCart} />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
