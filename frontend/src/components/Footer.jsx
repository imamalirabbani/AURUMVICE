import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Globe, Share2, Users, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer-luxury">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-luxury">
            <h2 className="luxury-logo">AURUMVICE</h2>
            <p className="luxury-tagline">THE HEIGHT OF FORMAL ELEGANCE</p>
          </div>
          
          <div className="footer-grid-luxury">
            <div className="footer-col-luxury">
              <h4>BOUTIQUE</h4>
              <Link to="/">New Arrivals</Link>
              <Link to="/">Men's Formal</Link>
              <Link to="/">Women's Couture</Link>
              <Link to="/">Accessories</Link>
            </div>
            
            <div className="footer-col-luxury">
              <h4>MAISON</h4>
              <Link to="/about">Our Story</Link>
              <Link to="/">Craftsmanship</Link>
              <Link to="/">Sustainability</Link>
              <Link to="/">Contact</Link>
            </div>
            
            <div className="footer-col-luxury">
              <h4>SERVICES</h4>
              <Link to="/">Shipping</Link>
              <Link to="/">Returns</Link>
              <Link to="/">Bespoke Service</Link>
              <Link to="/">Care Guide</Link>


              
            </div>
          </div>
        </div>

        <div className="footer-newsletter-luxury">
          <div className="newsletter-content">
            <h3>JOIN THE MAISON</h3>
            <p>Subscribe for exclusive access to new collections and private events.</p>
            <div className="newsletter-input-luxury">
              <input type="email" placeholder="EMAIL ADDRESS" />
              <button>SUBSCRIBE</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom-luxury">
          <p>&copy; {new Date().getFullYear()} AURUMVICE. ALL RIGHTS RESERVED.</p>
          <div className="footer-social-minimal">
            <a href="#"><Globe size={16} /></a>
            <a href="#"><Share2 size={16} /></a>
            <a href="#"><Users size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
