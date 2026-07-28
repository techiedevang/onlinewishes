import React from 'react';

export const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background Glow */}
    <circle cx="60" cy="60" r="50" fill="url(#bg-gradient)" opacity="0.15" />
    <circle cx="60" cy="60" r="40" fill="url(#bg-gradient)" opacity="0.2" />

    {/* Gift Box Base */}
    <path 
      d="M35 60 L60 75 L85 60 L85 90 L60 105 L35 90 Z" 
      fill="url(#box-left-gradient)" 
    />
    <path 
      d="M60 75 L85 60 L85 90 L60 105 Z" 
      fill="url(#box-right-gradient)" 
    />
    
    {/* Gift Box Lid (Opening Upwards) */}
    <path 
      d="M30 45 L60 60 L90 45 L60 30 Z" 
      fill="url(#lid-gradient)" 
      className="origin-bottom transform -rotate-12 transition-transform duration-500 ease-out"
    />
    
    {/* Ribbon */}
    <path 
      d="M45 37.5 L60 60 M75 37.5 L60 60 M60 75 L60 105" 
      stroke="url(#ribbon-gradient)" 
      strokeWidth="4" 
      strokeLinecap="round" 
    />
    <path 
      d="M50 30 C50 20, 60 20, 60 30 M70 30 C70 20, 60 20, 60 30" 
      stroke="url(#ribbon-gradient)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      fill="none"
    />

    {/* Magical Sparks escaping the box */}
    <path 
      d="M60 50 L63 42 L71 39 L63 36 L60 28 L57 36 L49 39 L57 42 Z" 
      fill="url(#sparkle-gradient)" 
      className="animate-pulse origin-center"
    />
    
    <circle cx="45" cy="25" r="3" fill="#FBBF24" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '0.2s' }} />
    <circle cx="75" cy="20" r="2.5" fill="#34D399" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
    <circle cx="80" cy="35" r="4" fill="#F472B6" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '0.1s' }} />

    {/* Gradients */}
    <defs>
      <linearGradient id="bg-gradient" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F43F5E" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      
      <linearGradient id="box-left-gradient" x1="35" y1="60" x2="60" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E11D48" />
        <stop offset="1" stopColor="#BE123C" />
      </linearGradient>

      <linearGradient id="box-right-gradient" x1="60" y1="60" x2="85" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F43F5E" />
        <stop offset="1" stopColor="#E11D48" />
      </linearGradient>

      <linearGradient id="lid-gradient" x1="30" y1="30" x2="90" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FB7185" />
        <stop offset="1" stopColor="#F43F5E" />
      </linearGradient>

      <linearGradient id="ribbon-gradient" x1="40" y1="20" x2="80" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>

      <linearGradient id="sparkle-gradient" x1="49" y1="28" x2="71" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D" />
        <stop offset="1" stopColor="#10B981" />
      </linearGradient>
    </defs>
  </svg>
);
