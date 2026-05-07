import React, { useEffect, useState } from 'react';

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase('reveal'), 500));
    timers.push(setTimeout(() => setPhase('text'), 2500));
    timers.push(setTimeout(() => setPhase('exit'), 5500));
    timers.push(setTimeout(() => onComplete(), 7000));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`intro-animation-white ${phase}`}>
      <div className="intro-center">
        <div className="intro-av-logo">
          <svg viewBox="0 0 300 300" className="intro-av-svg">
            <defs>
              <filter id="leatherTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="#111111" surfaceScale="2">
                  <feDistantLight azimuth="45" elevation="60" />
                </feDiffuseLighting>
                <feComposite operator="in" in2="SourceGraphic" />
              </filter>
              
              <filter id="paperTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="#ffffff" surfaceScale="1">
                  <feDistantLight azimuth="45" elevation="40" />
                </feDiffuseLighting>
              </filter>
            </defs>

            {/* Subtle background texture */}
            <rect width="300" height="300" filter="url(#paperTexture)" opacity="0.05" />

            <g filter="url(#leatherTexture)">
              {/* Left Thin Leg of A */}
              <path 
                d="M85,230 L135,80" 
                stroke="#1a1a1a" 
                strokeWidth="5" 
                fill="none" 
              />
              
              {/* Bottom Serif A */}
              <path d="M70,230 L100,230" stroke="#1a1a1a" strokeWidth="2.5" />

              {/* Shared Middle Thick Leg */}
              <path 
                d="M135,80 L175,230" 
                stroke="#1a1a1a" 
                strokeWidth="20" 
                fill="none" 
              />

              {/* Right Thin Leg of V */}
              <path 
                d="M175,230 L225,80" 
                stroke="#1a1a1a" 
                strokeWidth="5" 
                fill="none" 
              />

              {/* Top Serif V */}
              <path d="M210,80 L240,80" stroke="#1a1a1a" strokeWidth="2.5" />

              {/* Extended Horizontal Bar */}
              <path 
                d="M102,158 L195,158" 
                stroke="#1a1a1a" 
                strokeWidth="3.5" 
                fill="none" 
              />
            </g>
          </svg>
        </div>

        <div className="intro-white-brand">AURUMVICE</div>
        <div className="intro-white-line" />
      </div>
    </div>
  );
};

export default IntroAnimation;
