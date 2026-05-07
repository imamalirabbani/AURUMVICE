import React from 'react';
import { motion } from "framer-motion";

const IntroAnimation = ({ onComplete }) => {
  return (
    <div className="intro-animation-framer">
      {/* Subtle background texture from our previous version */}
      <div className="intro-bg-overlay" />
      
      <motion.div
        initial={{
          opacity: 0,
          y: 80,
          scale: 0.8,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 1.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        onAnimationComplete={() => {
          // Delay a bit after animation finishes before entering the site
          setTimeout(onComplete, 1200);
        }}
        className="relative intro-logo-container"
      >
        {/* Using our high-fidelity SVG since /logo.png is missing */}
        <div className="intro-av-logo-wrapper">
          <svg viewBox="0 0 300 300" className="intro-av-svg-framer">
            <defs>
              <filter id="leatherTexture">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                <feDiffuseLighting in="noise" lightingColor="#111111" surfaceScale="2">
                  <feDistantLight azimuth="45" elevation="60" />
                </feDiffuseLighting>
                <feComposite operator="in" in2="SourceGraphic" />
              </filter>
            </defs>

            <g filter="url(#leatherTexture)">
              <path d="M85,230 L135,80" stroke="#1a1a1a" strokeWidth="5" fill="none" />
              <path d="M70,230 L100,230" stroke="#1a1a1a" strokeWidth="2.5" />
              <path d="M135,80 L175,230" stroke="#1a1a1a" strokeWidth="20" fill="none" />
              <path d="M175,230 L225,80" stroke="#1a1a1a" strokeWidth="5" fill="none" />
              <path d="M210,80 L240,80" stroke="#1a1a1a" strokeWidth="2.5" />
              <path d="M102,158 L195,158" stroke="#1a1a1a" strokeWidth="3.5" fill="none" />
            </g>
          </svg>
        </div>

        {/* Glow Effect from your snippet */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{
            duration: 2,
            delay: 0.3,
          }}
          className="intro-glow"
        />
      </motion.div>
    </div>
  );
};

export default IntroAnimation;
