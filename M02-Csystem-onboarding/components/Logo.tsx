import React from 'react';

const Logo: React.FC = () => {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
    >
      <defs>
        <linearGradient id="gradCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" /> {/* Cyan */}
          <stop offset="100%" stopColor="#2563EB" /> {/* Blue */}
        </linearGradient>
        
        <linearGradient id="gradBlueDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" /> {/* Blue */}
          <stop offset="100%" stopColor="#0F172A" /> {/* Dark Slate */}
        </linearGradient>

        <linearGradient id="gradLight" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="#67E8F9" /> {/* Light Cyan */}
             <stop offset="100%" stopColor="#3B82F6" /> {/* Blue */}
        </linearGradient>
      </defs>
      
      {/* Outer Hexagon Border */}
      <path 
        d="M50 2 L98 27.5 L98 72.5 L50 98 L2 72.5 L2 27.5 Z" 
        stroke="#0EA5E9" 
        strokeWidth="1.5"
        fill="rgba(15, 23, 42, 0.2)"
      />

      {/* 
         Constructing the "S" shape.
         The S is composed of two interlocking folded ribbon shapes.
      */}

      {/* Top Part of S (The "Hood") */}
      {/* Left face (Cyan/Light) */}
      <path d="M50 15 L20 30 L20 50 L50 35 Z" fill="url(#gradLight)" opacity="0.9" />
      {/* Top face */}
      <path d="M50 15 L80 30 L50 45 L20 30 Z" fill="#22D3EE" opacity="0.6" />
      {/* Right face (Darker) */}
      <path d="M50 35 L80 50 L80 30 L50 15 Z" fill="url(#gradBlueDark)" />

      {/* Middle Connector / Spine */}
      <path d="M20 50 L50 65 L50 35 L20 20 Z" fill="url(#gradCyanBlue)" opacity="0.0" /> {/* Invisible helper */}

      {/* Bottom Part of S (Inverted Hood) */}
      {/* Right face (Cyan/Light) */}
      <path d="M50 85 L80 70 L80 50 L50 65 Z" fill="url(#gradLight)" opacity="0.9" />
      {/* Bottom face */}
      <path d="M50 85 L20 70 L50 55 L80 70 Z" fill="#22D3EE" opacity="0.6" />
      {/* Left face (Darker) */}
      <path d="M50 65 L20 50 L20 70 L50 85 Z" fill="url(#gradBlueDark)" />

      {/* Connecting the S visually */}
      {/* Top-Mid overlap */}
      <path d="M20 50 L50 65 L50 55 L20 40 Z" fill="url(#gradCyanBlue)" />
      {/* Bot-Mid overlap */}
      <path d="M80 50 L50 35 L50 45 L80 60 Z" fill="url(#gradCyanBlue)" />

      {/* Center Detail to lock them */}
      <path d="M50 45 L65 52.5 L50 60 L35 52.5 Z" fill="#22D3EE" />

    </svg>
  );
};

export default Logo;