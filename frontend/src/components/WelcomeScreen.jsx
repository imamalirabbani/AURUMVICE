import React, { useEffect, useState } from 'react';

const WelcomeScreen = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  return (
    <div className={`welcome-screen ${isVisible ? 'visible' : ''} ${isExiting ? 'exit' : ''}`}>
      <div className="welcome-content">
        <div className="welcome-tagline">ESTABLISHED 2026</div>
        
        <div className="welcome-logo-container">
          <h1 className="welcome-title">AURUMVICE</h1>
          <div className="welcome-subtitle-luxury">THE PINNACLE OF LUXURY</div>
        </div>
        
        <div className="welcome-divider-luxury"></div>
        
        <p className="welcome-description">
          Welcome to a world where craftsmanship meets sophistication. 
          Discover our curated collection of extraordinary pieces designed for those 
          who appreciate the finer things in life.
        </p>
        
        <button className="welcome-btn-luxury" onClick={handleEnter}>
          ENTER THE GALLERY
        </button>
      </div>
      
      <div className="welcome-background-luxury">
        <div className="luxury-overlay"></div>
        <div className="luxury-blob-gold"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
