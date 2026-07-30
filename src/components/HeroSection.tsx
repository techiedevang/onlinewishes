import React from 'react';
import { Heart, Sparkles, Gift, Play, ArrowRight, ShieldCheck, Zap, Users, CheckCircle2, Star } from 'lucide-react';
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
    <div className="relative overflow-hidden bg-gradient-to-b from-rose-50/90 via-pink-50/60 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-16 pb-24 md:pt-24 md:pb-36">
      
      {/* Immersive Background Photo Collage with Sophisticated Vignette & Gradient Mask */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-20 opacity-25 dark:opacity-15 mix-blend-soft-light dark:mix-blend-color-dodge filter brightness-105 saturate-110 pointer-events-none transition-all duration-1000"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2200&q=85')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/60 dark:from-zinc-950/90 dark:via-zinc-950/50 dark:to-zinc-950/90 -z-15 pointer-events-none" />

      {/* Background Decorative Glowing Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink-400/20 dark:bg-rose-600/15 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-400/15 dark:bg-amber-600/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Copy & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Eyebrow Tag */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-rose-100/80 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-rose-200 dark:border-rose-800 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Viral 21-Photo Surprise Box & Memory Website Builder</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
            >
              Create Unforgettable <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Digital Gift Websites
              </span> <br />
              for Besties, GFs & Sisters
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Turn your favorite memories into an interactive unboxing experience. Floating photo box, heart confetti, custom romantic poems, 3D flipbook scrapbook, and instant shareable domain links!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2"
            >
              <button
                onClick={onOpenCustomizer}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-rose-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group"
              >
                <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                <span>Build Website Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onTrySamplePreview}
                className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-base rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600">
                  <Play className="w-4 h-4 fill-rose-600 translate-x-0.5" />
                </div>
                <span>Try Live Photo Preview</span>
              </button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Password Protection</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% Mobile Friendly</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column - Interactive Hero Card & Preview Graphic */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            
            {/* Parallax Floating Photo Stack Graphic */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto max-w-[95%] sm:max-w-md lg:max-w-none"
            >
              {/* Main Card Frame */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-2xl border border-rose-100 dark:border-slate-800 relative z-10 overflow-hidden w-full">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-2">
                      onlinewishes.in/bestie-surprise
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                    LIVE DEMO
                  </span>
                </div>

                {/* Simulated 3D Gift Box & Floating Photos */}
                <div className="relative h-64 bg-gradient-to-br from-pink-100/70 via-rose-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden p-4 group cursor-pointer" onClick={onTrySamplePreview}>
                  
                  {/* Floating Mini Photos Stack */}
                  <div className="absolute top-3 left-4 w-16 h-20 bg-white p-1 rounded shadow-md -rotate-12 group-hover:-rotate-18 transition-transform">
                    <img src="/IMG-20260710-WA0007.jpg" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300'; }} alt="Memory 1" className="w-full h-full object-cover rounded-sm" />
                  </div>

                  <div className="absolute top-2 right-4 w-16 h-20 bg-white p-1 rounded shadow-md rotate-12 group-hover:rotate-24 transition-transform">
                    <img src="/IMG-20260710-WA0008.jpg" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=300'; }} alt="Memory 2" className="w-full h-full object-cover rounded-sm" />
                  </div>

                  <div className="absolute bottom-3 left-8 w-16 h-20 bg-white p-1 rounded shadow-md -rotate-6 group-hover:-rotate-12 transition-transform">
                    <img src="/IMG-20260710-WA0009.jpg" loading="lazy" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300'; }} alt="Memory 3" className="w-full h-full object-cover rounded-sm" />
                  </div>

                  {/* Center Gift Box Icon */}
                  <div className="text-center space-y-2 z-10">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 group-hover:scale-110 transition-transform">
                      <Gift className="w-10 h-10 animate-bounce" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                        Tap To Unbox 21 Memories
                      </p>
                      <p className="text-xs text-rose-500 font-semibold">
                        Interactive Music & Confetti
                      </p>
                    </div>
                  </div>

                </div>

                {/* Rating & Social Proof */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      4.98/5.0
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    12,400+ Websites Launched
                  </span>
                </div>

              </div>

              {/* Floating Decorative Pill */}
              <div className="absolute -bottom-5 left-4 sm:-left-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-xl flex items-center space-x-3 z-20">
                <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-pink-500 font-bold text-sm">
                  21
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Floating Photos</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Pop-out physics animation</p>
                </div>
              </div>

            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
