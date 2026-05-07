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
          <svg viewBox="0 0 400 300" className="intro-av-svg">
            <defs>
              <filter id="leatherNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" stitchTiles="stitch"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" />
                <feComposite operator="in" in2="SourceGraphic" result="texture"/>
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
              </filter>
            </defs>
            <g filter="url(#leatherNoise)" fill="#1a1a1a">
              {/* Modern Serif AV Ligature Design */}
              {/* A structure */}
              <path d="M80,220 L110,220 L110,218 L100,218 C92,218 90,215 92,208 L145,80 L155,80 L210,208 C212,215 210,218 202,218 L192,218 L192,220 L225,220 L225,218 L215,218 C207,218 205,215 207,208 L202,195 L128,195 L123,208 C121,215 119,218 111,218 Z M131,185 L198,185 L165,105 Z" />
              
              {/* V structure intertwined */}
              <path d="M190,80 L220,80 L220,82 L210,82 C202,82 200,85 202,92 L245,208 C247,215 245,218 237,218 L227,218 L227,220 L260,220 L260,218 L250,218 C242,218 240,215 242,208 L285,92 C287,85 285,82 277,82 L267,82 L267,80 L300,80 L300,82 L290,82 C282,82 280,85 282,92 L255,160 L235,110 L220,80 Z" />
              
              {/* Refined connection bar for A */}
              <rect x="115" y="145" width="100" height="1.5" />
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
