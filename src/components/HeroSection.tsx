import React from 'react';
import { Sparkles, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onExploreTemplates: () => void;
  onOpenCustomizer: () => void;
  onTrySamplePreview: () => void;
}

export function HeroSection({
  onExploreTemplates,
  onOpenCustomizer,
  onTrySamplePreview,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen w-full bg-lovely-violet overflow-hidden flex items-center justify-center px-4">
      
      {/* Background Shapes */}
      <div className="absolute top-20 left-8 sm:top-24 sm:left-16 z-10">
        <svg width="60" height="60" viewBox="0 0 100 100" className="sm:w-20 sm:h-20">
          <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" fill="#F2C94C" stroke="#000" strokeWidth="4"></path>
          <ellipse cx="45" cy="35" rx="6" ry="4" fill="white" opacity="0.5"></ellipse>
        </svg>
      </div>
      <div className="absolute bottom-32 left-12 sm:bottom-40 sm:left-24 z-10">
        <svg width="70" height="70" viewBox="0 0 100 100" className="sm:w-24 sm:h-24">
          <path d="M50 85 C50 85, 10 55, 10 35 C10 20, 22 10, 35 10 C42 10, 47 15, 50 20 C53 15, 58 10, 65 10 C78 10, 90 20, 90 35 C90 55, 50 85, 50 85Z" fill="#FF4D8D" stroke="#000" strokeWidth="4"></path>
          <ellipse cx="30" cy="30" rx="8" ry="5" fill="white" opacity="0.4"></ellipse>
        </svg>
      </div>
      <div className="absolute top-24 right-8 sm:top-40 sm:right-16 z-10">
        <svg width="80" height="80" viewBox="0 0 100 100" className="sm:w-28 sm:h-28">
          <path d="M50 85 C50 85, 10 55, 10 35 C10 20, 22 10, 35 10 C42 10, 47 15, 50 20 C53 15, 58 10, 65 10 C78 10, 90 20, 90 35 C90 55, 50 85, 50 85Z" fill="#FF4D8D" stroke="#000" strokeWidth="4"></path>
          <ellipse cx="30" cy="30" rx="8" ry="5" fill="white" opacity="0.4"></ellipse>
        </svg>
      </div>
      <div className="absolute bottom-24 right-12 sm:bottom-32 sm:right-24 z-10">
        <svg width="50" height="50" viewBox="0 0 100 100" className="sm:w-16 sm:h-16">
          <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" fill="#F2C94C" stroke="#000" strokeWidth="4"></path>
          <ellipse cx="45" cy="35" rx="6" ry="4" fill="white" opacity="0.5"></ellipse>
        </svg>
      </div>
      <div className="absolute top-1/4 left-1/4 animate-pulse">
        <svg width="30" height="30" viewBox="0 0 100 100" className="">
          <path d="M50 0 L55 35 L90 40 L55 45 L50 80 L45 45 L10 40 L45 35 Z" fill="#A78BFA" stroke="#000" strokeWidth="3"></path>
        </svg>
      </div>
      <div className="absolute bottom-1/3 right-1/4 animate-pulse delay-300">
        <svg width="25" height="25" viewBox="0 0 100 100" className="">
          <path d="M50 0 L55 35 L90 40 L55 45 L50 80 L45 45 L10 40 L45 35 Z" fill="#A78BFA" stroke="#000" strokeWidth="3"></path>
        </svg>
      </div>

      <div className="relative mb-24 z-20 w-full max-w-5xl bg-white rounded-[2rem] border-[6px] border-black p-8 sm:p-12 lg:p-16 text-center shadow-[12px_12px_0px_rgba(0,0,0,1)]">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 uppercase text-black font-black">
          Create <span className="text-lovely-neon">Beautiful</span> Moments
        </h1>
        <p className="font-body text-base sm:text-lg md:text-xl text-gray-700 font-bold mb-6 sm:mb-8 max-w-xl mx-auto">
          Design personalized love pages in minutes and share them ;) <br/>Make someone smile today
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button 
            onClick={onOpenCustomizer}
            className="flex items-center justify-center gap-2 text-sm sm:text-base uppercase bg-lovely-neon text-white font-bold border-4 border-black rounded-xl px-6 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Valentine Special
          </button>
          
          <button 
            onClick={onExploreTemplates}
            className="flex items-center justify-center gap-2 text-sm sm:text-base uppercase bg-lovely-yellow text-black font-bold border-4 border-black rounded-xl px-6 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            See Templates
          </button>
        </div>

        {/* Cats decorations */}
        <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-20 h-20 sm:w-28 sm:h-28">
          <img alt="Cute cat" loading="eager" className="w-full h-full object-cover rounded-full border-4 border-black shadow-lg" src="https://res.cloudinary.com/dt94eifov/image/upload/lovely/defaults/hero_cat_bottom_right.jpg" />
        </div>
        <div className="absolute -top-6 -left-6 sm:-top-6 sm:-left-6 w-20 h-20 sm:w-28 sm:h-28">
          <img alt="Cute cat" loading="eager" className="w-full h-full object-contain rounded-full border-4 border-black shadow-lg" src="https://res.cloudinary.com/dt94eifov/image/upload/lovely/defaults/hero_cat_top_left.jpg" />
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full flex justify-center">
        <img alt="Scroll Indicator" src="https://res.cloudinary.com/dt94eifov/image/upload/lovely/defaults/group-of-cute-kitty-cat-family-greeting-cartoon-png.webp" className="w-[400px] h-auto object-contain" />
      </div>
    </section>
  );
}
