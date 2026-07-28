import React, { useState } from 'react';
import { Template, UserCustomization } from '../types';
import { InteractiveSurpriseTemplate } from './InteractiveSurpriseTemplate';
import { ErrorBoundary } from './ErrorBoundary';
import { Smartphone, Monitor, Tablet, X, Share2, Copy, Check, ExternalLink } from 'lucide-react';

interface LivePreviewModalProps {
  template: Template;
  customization: UserCustomization;
  onClose: () => void;
  onCustomizeThis: () => void;
}

export function LivePreviewModal({
  template,
  customization,
  onClose,
  onCustomizeThis,
}: LivePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`https://onlinewishes.in/p/${customization.subdomain || 'bestie-21'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden">
      
      {/* Top Modal Toolbar */}
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xl mb-2 text-white">
        
        {/* Template Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
            LIVE
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{template.title}</h3>
            <p className="text-[11px] text-slate-400">Previewing for {customization.recipientName || 'Bestie'}</p>
          </div>
        </div>

        {/* Device Simulator Switcher */}
        <div className="hidden sm:flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              deviceMode === 'mobile' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Mobile preview"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden md:inline">Mobile (375px)</span>
          </button>
          
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              deviceMode === 'tablet' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Tablet preview"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden md:inline">Tablet</span>
          </button>

          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
              deviceMode === 'desktop' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
            aria-label="Desktop preview"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline">Desktop</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied Link!' : 'Share Link'}</span>
          </button>

          <button
            onClick={onCustomizeThis}
            className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1"
          >
            <span>Customize & Buy</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Frame Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-2">
        <div
          className={`h-full transition-all duration-300 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative bg-slate-900 ${
            deviceMode === 'mobile'
              ? 'w-[375px] max-h-[700px] border-[10px] border-slate-800 rounded-[40px]'
              : deviceMode === 'tablet'
              ? 'w-[720px] max-h-[750px] border-[12px] border-slate-800 rounded-[30px]'
              : 'w-full max-w-5xl h-full'
          }`}
        >
          {/* Top Notch for mobile frame */}
          {deviceMode === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-50 pointer-events-none" />
          )}

          <ErrorBoundary>
            <InteractiveSurpriseTemplate
              key={`${customization.bgTheme || template.id}-${customization.enablePasscode}-${customization.secretPasscode}`}
              customization={{
                ...customization,
                bgTheme: customization.bgTheme || template.id,
                occasion: customization.occasion || template.category,
                enablePasscode: customization.enablePasscode,
                secretPasscode: customization.secretPasscode,
                ambientSoundscape: customization.ambientSoundscape || (template.id === 'romantic-love-story' ? 'romantic_piano' : (template.id === 'celestial-galaxy' ? 'stargazing_night' : (template.id === 'vintage-parchment' ? 'library_whispers' : (template.id === 'birthday-confetti-party' ? 'birthday_light' : (template.id === 'retro-90s-arcade' ? 'arcade_8bit' : (template.id === 'minimalist-editorial' ? 'library_whispers' : 'rainy_cafe')))))),
              }}
              onClose={onClose}
              isStandaloneView={true}
            />
          </ErrorBoundary>
        </div>
      </div>

    </div>
  );
}
