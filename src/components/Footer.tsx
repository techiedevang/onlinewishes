import React from 'react';
import { Heart, ShieldCheck, Mail, Info, FileText, RefreshCw, Lock, Instagram } from 'lucide-react';
import { Logo } from './Logo';
import { PolicyTab } from './PolicyModal';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenPolicy: (tab: PolicyTab) => void;
  onOpenSeoModal?: () => void;
}

export function Footer({ onOpenAdmin, onOpenPolicy }: FooterProps) {
  return (
    <footer className="bg-zinc-950 text-slate-400 py-12 border-t border-zinc-800 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Logo className="w-8 h-8" />
              <span className="font-extrabold text-lg text-white">
                Online<span className="text-rose-500">Wishes</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier SaaS platform for creating viral 21-photo surprise memory websites for besties, girlfriends, sisters, and family.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <Lock className="w-3 h-3" />
              <span>256-Bit SSL Passcode Protected</span>
            </div>
            <div className="pt-2">
              <a 
                href="https://instagram.com/onlinewishes.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 transition-all transform hover:scale-105 active:scale-95 origin-left"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
                <span>@onlinewishes.in</span>
              </a>
            </div>
          </div>

          {/* Quick Links / Templates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Templates
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/templates" className="hover:text-rose-400 transition-colors">👭 Bestie 21-Photo Surprise</a></li>
              <li><a href="/templates" className="hover:text-rose-400 transition-colors">❤️ Romantic Love Vault</a></li>
              <li><a href="/templates" className="hover:text-rose-400 transition-colors">🎉 Birthday Confetti Cannon</a></li>
              <li><a href="/templates" className="hover:text-rose-400 transition-colors">🌸 Sister Memory Tree</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenPolicy('about')}
                  className="hover:text-rose-400 transition-colors text-left flex items-center space-x-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('contact')}
                  className="hover:text-rose-400 transition-colors text-left flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Legal & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-rose-400 transition-colors text-left flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-rose-400 transition-colors text-left flex items-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('refund')}
                  className="hover:text-rose-400 transition-colors text-left flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Refund Policy</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} OnlineWishes. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => onOpenPolicy('privacy')} className="hover:text-slate-300 transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => onOpenPolicy('terms')} className="hover:text-slate-300 transition-colors">Terms of Service</button>
            <span>•</span>
            <button onClick={() => onOpenPolicy('refund')} className="hover:text-slate-300 transition-colors">Refund Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}

