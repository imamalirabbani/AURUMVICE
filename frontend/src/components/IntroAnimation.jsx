import React, { useEffect, useState } from 'react';

const IntroAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setPhase('reveal'), 200));
    timers.push(setTimeout(() => setPhase('text'), 1800));
    timers.push(setTimeout(() => setPhase('exit'), 3500));
    timers.push(setTimeout(() => onComplete(), 4500));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`intro-animation-white ${phase}`}>
      <div className="intro-center">
        <div className="intro-av-logo">
          <svg viewBox="0 0 300 200" className="intro-av-svg">
            {/* A - left leg (thick) */}
            <polygon points="60,170 72,170 120,40 112,40" fill="#1a1a1a" />
            {/* A - right leg / V - left leg (shared diagonal, thick) */}
            <polygon points="112,40 120,40 168,170 160,170" fill="#1a1a1a" />
            {/* A - crossbar */}
            <rect x="82" y="118" width="60" height="3.5" fill="#1a1a1a" />
            
            {/* V - right leg (thick) */}
            <polygon points="160,170 168,170 240,40 228,40" fill="#1a1a1a" />
            
            {/* A - left serif bottom */}
            <rect x="52" y="168" width="28" height="3" fill="#1a1a1a" />
            {/* A - top serif */}
            <rect x="105" y="37" width="22" height="2.5" fill="#1a1a1a" />
            {/* V - right serif top */}
            <rect x="224" y="37" width="22" height="2.5" fill="#1a1a1a" />
            {/* shared bottom serif */}
            <rect x="152" y="168" width="24" height="3" fill="#1a1a1a" />
          </svg>
        </div>

        <div className="intro-white-brand">AURUMVICE</div>
        <div className="intro-white-line" />
      </div>
    </div>
  );
};

export default IntroAnimation;
