import React, { useEffect, useState } from 'react';

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase('reveal'), 150));
    timers.push(setTimeout(() => setPhase('text'), 1200));
    timers.push(setTimeout(() => setPhase('exit'), 2500));
    timers.push(setTimeout(() => onComplete(), 3200));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`intro-animation-white ${phase}`}>
      <div className="intro-center">
        <div className="intro-av-logo">
          <svg viewBox="0 0 300 200" className="intro-av-svg">
            <defs>
              <filter id="leatherNoise">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" stitchTiles="stitch"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.15 0" />
                <feComposite operator="in" in2="SourceGraphic" result="texture"/>
                <feBlend mode="multiply" in="texture" in2="SourceGraphic" />
              </filter>
            </defs>
            <g filter="url(#leatherNoise)">
              {/* A - left leg (thin) */}
              <polygon points="67,160 73,160 123,40 117,40" fill="#1a1a1a" />
              
              {/* Middle leg (thick) */}
              <polygon points="163,160 187,160 147,40 123,40" fill="#1a1a1a" />
              
              {/* V - right leg (thin) */}
              <polygon points="182,160 188,160 238,40 232,40" fill="#1a1a1a" />
              
              {/* A - crossbar */}
              <rect x="90" y="104" width="95" height="3" fill="#1a1a1a" />
              
              {/* A - left bottom serif */}
              <rect x="55" y="158" width="30" height="2" fill="#1a1a1a" />
              
              {/* A - top left serif */}
              <rect x="105" y="40" width="18" height="2" fill="#1a1a1a" />
              
              {/* V - right top serif */}
              <rect x="220" y="40" width="30" height="2" fill="#1a1a1a" />
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
