import React, { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenUserDashboard?: () => void;
  onOpenAdmin: () => void;
  onOpenSeoModal?: () => void;
  onOpenCustomAiModal?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenUserDashboard,
  onOpenAdmin,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-transparent">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2"
              aria-label="OnlineWishes Home Page"
            >
              <img alt="Lovely" className="h-10 sm:h-12 w-auto drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" src="https://res.cloudinary.com/dt94eifov/image/upload/lovely/defaults/lovely-logo-new.png" />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab('templates')} 
                className="font-body font-semibold uppercase text-sm tracking-wide hover:text-lovely-neon transition-colors text-white drop-shadow-md"
              >
                Templates
              </button>
              <button 
                onClick={() => setActiveTab('pricing')} 
                className="font-body font-semibold uppercase text-sm tracking-wide hover:text-lovely-neon transition-colors text-white drop-shadow-md"
              >
                Pricing
              </button>
              {currentUser ? (
                <button
                  onClick={onOpenUserDashboard || onOpenAuth}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-bold text-sm border border-white/40 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-bold text-sm border border-white/40 transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                >
                  Sign In
                </button>
              )}
            </nav>
            <div className="flex md:hidden items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20" 
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-lovely-plum/70 backdrop-blur-xl transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setMobileMenuOpen(false)}
        />
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-gradient-to-br from-lovely-plum to-lovely-violet backdrop-blur-2xl border-l border-white/10 transform transition-transform duration-500 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute z-50 top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center" 
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex flex-col h-full pt-20 pb-8 px-6 relative">
            <div className="absolute z-0 top-0 left-[10vw] w-full">
              <img alt="Scroll Indicator" loading="lazy" className="w-[150px]" src="https://res.cloudinary.com/dt94eifov/image/upload/lovely/defaults/navbar-hanging-cat-new.png" />
            </div>
            <nav className="flex flex-col gap-2 flex-grow mt-16 relative z-10">
              <button onClick={() => {setActiveTab('home'); setMobileMenuOpen(false);}} className="group flex items-center justify-between py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-lovely-neon/50 transition-all duration-300">
                <span className="font-heading text-xl uppercase text-white group-hover:text-lovely-neon transition-colors">Home</span>
              </button>
              <button onClick={() => {setActiveTab('templates'); setMobileMenuOpen(false);}} className="group flex items-center justify-between py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-lovely-neon/50 transition-all duration-300">
                <span className="font-heading text-xl uppercase text-white group-hover:text-lovely-neon transition-colors">Templates</span>
              </button>
              {currentUser?.role === 'admin' && (
                <button onClick={() => {onOpenAdmin(); setMobileMenuOpen(false);}} className="group flex items-center justify-between py-2 px-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-lovely-yellow/50 transition-all duration-300">
                  <span className="font-heading text-xl uppercase text-white group-hover:text-lovely-yellow transition-colors">Admin Panel</span>
                </button>
              )}
            </nav>
            <button 
              onClick={() => {
                if (currentUser && onOpenUserDashboard) { onOpenUserDashboard(); } else { onOpenAuth(); }
                setMobileMenuOpen(false);
              }}
              className="w-full uppercase mt-6 flex items-center justify-center gap-2 bg-lovely-neon text-white font-bold border-4 border-black rounded-xl px-6 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <Sparkles className="w-5 h-5" />
              {currentUser ? 'Dashboard' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
