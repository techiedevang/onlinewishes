import React, { useState } from 'react';
import { Heart, Sparkles, Moon, Sun, Menu, X, Shield, Layout, UserCheck, IndianRupee } from 'lucide-react';
import { User } from '../types';

import { Logo } from './Logo';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
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
  darkMode,
  onToggleDarkMode,
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenUserDashboard,
  onOpenAdmin,
  onOpenSeoModal,
  onOpenCustomAiModal,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'customizer', label: 'Studio Builder', icon: Heart },
    { id: 'pricing', label: 'Pricing', icon: IndianRupee },
  ];

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
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Online<span className="text-rose-500">Wishes</span>
              </span>
              <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Surprise & Gift Website Builder
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-500' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {onOpenCustomAiModal && (
            <button
              onClick={onOpenCustomAiModal}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-rose-500 text-white font-bold text-xs rounded-full shadow-sm hover:opacity-90 transition-opacity ml-1"
              title="Request a custom website idea built by AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Custom Idea</span>
            </button>
          )}
        </nav>

        {/* Right Tools & User Actions */}
        <div className="flex items-center space-x-2">

          {/* Admin Dashboard Trigger (If Admin user logged in) */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-500/20 transition-colors"
              title="Admin Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Admin Panel</span>
            </button>
          )}

          {/* Desktop User Auth Action (Hidden on mobile, moved into 3-lines mobile menu) */}
          <div className="hidden md:flex items-center space-x-2">
            {currentUser ? (
              <button
                onClick={onOpenUserDashboard || onOpenAuth}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700 transition-colors"
                aria-label="User profile settings and dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.mfaEnabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="MFA Secured" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button (3 lines icon) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer (3-lines menu) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-3 shadow-xl">
          
          {/* User Sign In / Profile in Mobile Drawer */}
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            {currentUser ? (
              <button
                onClick={() => {
                  if (onOpenUserDashboard) onOpenUserDashboard();
                  else onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-lg">
                  Dashboard
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 rounded-xl shadow-md active:scale-98 transition-all"
              >
                <UserCheck className="w-5 h-5" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {onOpenCustomAiModal && (
            <button
              onClick={() => {
                onOpenCustomAiModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-purple-500 to-rose-500 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request AI Custom Idea</span>
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-xl border border-amber-300 dark:border-amber-800"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
