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
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-rose-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          className="flex items-center space-x-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-lg p-1 group text-left"
          aria-label="OnlineWishes Home Page"
        >
          <Logo className="w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-md" />
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                Online<span className="text-rose-500">Wishes</span>
              </span>
              <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Surprise & Gift Website Builder
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.id === 'home' ? '/' : `/${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'customizer' && !currentUser) {
                    onOpenAuth();
                    return;
                  }
                  setActiveTab(item.id);
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : ''}`} />
                <span>{item.label}</span>
              </a>
            );
          })}

          {onOpenCustomAiModal && (
            <button
              onClick={onOpenCustomAiModal}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-rose-500 text-white font-bold text-xs rounded-full shadow-sm hover:opacity-90 transition-opacity ml-1"
              title="Request a custom wish website design blueprint"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Wish Blueprint</span>
            </button>
          )}
        </nav>

        {/* Right Tools & User Actions */}
        <div className="flex items-center space-x-2">
          
          
          {/* Admin Dashboard Trigger (If Admin user logged in) */}
          {currentUser && currentUser.role === 'admin' && (
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
              <Sparkles className="w-4 h-4" />
              <span>Request Custom Wish Blueprint</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
