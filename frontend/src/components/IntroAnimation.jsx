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
              {/* High-Accuracy Serif AV Ligature */}
              <path d="M75,240 L125,240 L125,237 L110,237 C100,237 98,234 100,225 L160,80 L175,80 L245,225 C247,234 245,237 235,237 L220,237 L220,240 L265,240 L265,237 L255,237 C245,237 243,234 245,225 L240,212 L145,212 L140,225 C138,234 136,237 126,237 Z M150,200 L235,200 L192,105 Z" />
              <path d="M185,80 L235,80 L235,83 L220,83 C210,83 208,86 210,95 L260,225 C262,234 260,237 250,237 L235,237 L235,240 L280,240 L280,237 L270,237 C260,237 258,234 260,225 L315,95 C317,86 315,83 305,83 L290,83 L290,80 L340,80 L340,83 L330,83 C320,83 318,86 320,95 L270,210 L245,150 L215,80 Z" />
              
              {/* Central connection bar matching image style */}
              <rect x="135" y="153" width="125" height="1.5" />
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
