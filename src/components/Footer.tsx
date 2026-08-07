import React from 'react';
import { Lock, Instagram, Info, Mail, ShieldCheck, FileText, RefreshCw, Star } from 'lucide-react';
import { PolicyTab } from './PolicyModal';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenPolicy: (tab: PolicyTab) => void;
  onOpenSeoModal?: () => void;
}

export function Footer({ onOpenAdmin, onOpenPolicy }: FooterProps) {
  return (
    <footer className="bg-lovely-violet text-white py-12 md:py-16 border-t-8 border-black transition-colors relative overflow-hidden">
      <div className="absolute top-10 left-10 opacity-30">
        <svg width="40" height="40" viewBox="0 0 100 100">
          <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" fill="#FFF" />
        </svg>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-12 max-w-7xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <img alt="Lovely" className="h-10 w-auto drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" src="https://res.cloudinary.com/dt94eifov/image/upload/lovely/defaults/lovely-logo-new.png" />
            </div>
            <p className="font-body font-bold text-sm text-white/90 leading-relaxed drop-shadow-sm">
              The premier platform for creating viral 21-photo surprise memory websites for your loved ones.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs font-heading bg-white text-black px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Lock className="w-3.5 h-3.5 text-lovely-pink" />
              <span>SSL Secured</span>
            </div>
            <div className="pt-2">
              <a 
                href="https://instagram.com/onlinewishes.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-2 bg-lovely-neon text-white font-heading font-bold uppercase px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow Us</span>
              </a>
            </div>
          </div>

          {/* Quick Links / Templates */}
          <div>
            <h4 className="font-heading text-xl font-black uppercase text-lovely-yellow mb-4 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              Templates
            </h4>
            <ul className="space-y-3 font-body font-bold text-sm">
              <li><a href="/templates" className="hover:text-lovely-neon transition-colors flex items-center gap-2"><Star className="w-3 h-3 text-lovely-yellow"/> Bestie Surprise</a></li>
              <li><a href="/templates" className="hover:text-lovely-neon transition-colors flex items-center gap-2"><Star className="w-3 h-3 text-lovely-yellow"/> Romantic Love Vault</a></li>
              <li><a href="/templates" className="hover:text-lovely-neon transition-colors flex items-center gap-2"><Star className="w-3 h-3 text-lovely-yellow"/> Birthday Cannon</a></li>
              <li><a href="/templates" className="hover:text-lovely-neon transition-colors flex items-center gap-2"><Star className="w-3 h-3 text-lovely-yellow"/> Sister Memory Tree</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-xl font-black uppercase text-lovely-yellow mb-4 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              Company
            </h4>
            <ul className="space-y-3 font-body font-bold text-sm">
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-lovely-neon transition-colors text-left flex items-center gap-2">
                  <Info className="w-4 h-4" /> About Us
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('contact')} className="hover:text-lovely-neon transition-colors text-left flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="font-heading text-xl font-black uppercase text-lovely-yellow mb-4 drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
              Legal
            </h4>
            <ul className="space-y-3 font-body font-bold text-sm">
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-lovely-neon transition-colors text-left flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-lovely-neon transition-colors text-left flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('refund')} className="hover:text-lovely-neon transition-colors text-left flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Refund Policy
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 mt-4 border-t-4 border-black/20 flex flex-col sm:flex-row items-center justify-between text-sm font-body font-bold text-white/80 gap-4">
          <p className="bg-black/30 px-4 py-2 rounded-lg">© {new Date().getFullYear()} OnlineWishes. Crafted with ❤️</p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button onClick={() => onOpenPolicy('privacy')} className="hover:text-lovely-yellow transition-colors">Privacy</button>
            <span className="text-lovely-pink">•</span>
            <button onClick={() => onOpenPolicy('terms')} className="hover:text-lovely-yellow transition-colors">Terms</button>
            <span className="text-lovely-pink">•</span>
            <button onClick={() => onOpenPolicy('refund')} className="hover:text-lovely-yellow transition-colors">Refund</button>
          </div>
        </div>

      </div>
    </footer>
  );
}

