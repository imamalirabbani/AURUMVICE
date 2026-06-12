import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import IntroAnimation from './components/IntroAnimation';
import Home from './pages/Home';

// Lazy load pages for performance
const About = lazy(() => import('./pages/About'));
const CartPage = lazy(() => import('./pages/Cart'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Pengaturan = lazy(() => import('./pages/Pengaturan'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));

import { api } from './services/api';
import './index.css';

// Minimal Loading Fallback
const PageLoader = () => (
  <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '20px', height: '2px', background: '#C5A059' }}></div>
  </div>
);

function AppContent({ cartCount, user, setUser, handleLogout, fetchCart }) {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  const isAdminPath = location.pathname.toLowerCase().includes('/admin');

  return (
    <>
      <ScrollToTop />
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      {!isAdminPath && <Navbar cartCount={cartCount} user={user} />}
      
      <main className={isAdminPath ? "admin-main" : "main-content container"}>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/my-orders" element={<MyOrders user={user} />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin/dashboard" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
            <Route path="/admin/orders" element={<AdminOrders user={user} onLogout={handleLogout} />} />
            <Route path="/admin/products" element={<AdminProducts user={user} onLogout={handleLogout} />} />
            <Route path="/admin/users" element={<AdminUsers user={user} onLogout={handleLogout} />} />
            <Route path="/admin/settings" element={<AdminSettings user={user} onLogout={handleLogout} />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPath && <Footer />}
    </>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Listen for forced logout (token expired/invalid)
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth-logout', handleForcedLogout);
    return () => window.removeEventListener('auth-logout', handleForcedLogout);
  }, []);

  return (
    <Router>
      <AppContent 
        cartCount={cartCount} 
        user={user} 
        setUser={setUser} 
        handleLogout={handleLogout} 
        fetchCart={fetchCart} 
      />
    </Router>
  );
}

export default App;
