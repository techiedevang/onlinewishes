import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface ConfessionDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function ConfessionDayView({ customization, onClose, isStandaloneView, isPreviewMode }: ConfessionDayViewProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const stages = ['greeting', 'message', 'floating_photos', 'poem', 'final'];

  useEffect(() => {
    if (stages[currentStage] === 'final' && !isPreviewMode) {
      const end = Date.now() + 3 * 1000;
      const colors = ['#8b5cf6', '#c084fc', '#e879f9'];
      
      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [currentStage, isPreviewMode]);

  const nextStage = () => {
    if (currentStage < stages.length - 1) setCurrentStage(prev => prev + 1);
  };

  const prevStage = () => {
    if (currentStage > 0) setCurrentStage(prev => prev - 1);
  };

  const renderStage = () => {
    switch (stages[currentStage]) {
      case 'greeting':
        return (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl mb-8 drop-shadow-2xl"
            >
              💬
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-fuchsia-100 mb-4 tracking-wider">
              {customization.recipientName || "A Secret Confession..."}
            </h1>
            <h2 className="text-3xl md:text-4xl text-fuchsia-300 font-light">
              For {customization.recipientName}
            </h2>
          </motion.div>
        );
      
      case 'message':
        return (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto text-center"
          >
            <Sparkles className="w-12 h-12 text-fuchsia-400 mb-8" />
            <div className="bg-purple-900/50 p-10 rounded-3xl shadow-2xl backdrop-blur-md border border-fuchsia-500/30">
              <p className="text-2xl md:text-3xl text-fuchsia-100 leading-relaxed font-light whitespace-pre-wrap">
                {customization.customParagraph || "There's something I've been meaning to tell you."}
              </p>
            </div>
          </motion.div>
        );

      case 'floating_photos':
        return (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <h2 className="text-3xl md:text-4xl font-light text-fuchsia-200 mb-10 tracking-widest uppercase text-sm">Clues</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {customization.memories.slice(0, 3).map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.3 }}
                  className="w-40 h-40 md:w-56 md:h-56 overflow-hidden border border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)] rounded-lg"
                >
                  <SafeImage
                    src={photo.imageUrl || ''} 
                    alt={`Clue ${index + 1}`}
                    className="w-full h-full object-cover filter brightness-90 hover:brightness-110 transition-all"
                    fallbackUrl="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=400&auto=format&fit=crop"
                  />
                </motion.div>
              ))}
              {(!customization.memories || customization.memories.length === 0) && (
                 <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-lg overflow-hidden border border-fuchsia-500/50 shadow-[0_0_30px_rgba(217,70,239,0.3)] bg-purple-900/50 flex items-center justify-center text-fuchsia-400"
                 >
                   <Heart size={48} className="opacity-50" />
                 </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 'poem':
        return (
          <motion.div
            key="poem"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto text-center"
          >
            <div className="bg-gradient-to-b from-purple-900/80 to-transparent p-12 rounded-t-3xl border-t border-fuchsia-500/30">
              <p className="text-xl md:text-2xl text-fuchsia-200 leading-loose font-serif italic whitespace-pre-wrap">
                {customization.customPoem || "Hidden in the quiet night,\nA truth I bring into the light.\nNo more secrets, no more hide,\nI want you right here by my side."}
              </p>
            </div>
          </motion.div>
        );

      case 'final':
        return (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-8"
            >
              💜
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-fuchsia-100 mb-6 tracking-wide">
              Truth Be Told
            </h2>
            <p className="text-2xl md:text-3xl text-fuchsia-400 font-light">
              Yours, {customization.senderName}
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* Deep purple mystical background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-950 to-black"></div>
      
      {!isStandaloneView && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-fuchsia-100"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-20">
        <div className="w-[800px] h-[800px] rounded-full bg-fuchsia-700 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {renderStage()}
          </AnimatePresence>
        </div>

        <div className="h-24 flex items-center justify-between px-6 md:px-12 bg-black/40 backdrop-blur-xl border-t border-purple-900/50">
          <button
            onClick={prevStage}
            disabled={currentStage === 0}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              currentStage === 0 
                ? 'opacity-0 cursor-default' 
                : 'bg-white/5 hover:bg-white/10 text-fuchsia-200 border border-fuchsia-500/20'
            }`}
          >
            Back
          </button>
          
          <div className="flex gap-3">
            {stages.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentStage ? 'bg-fuchsia-500 w-12 shadow-[0_0_10px_rgba(217,70,239,0.8)]' : 'bg-purple-900 w-4'
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentStage === stages.length - 1 ? onClose : nextStage}
            className="px-6 py-3 rounded-full font-medium bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)] border border-fuchsia-400/50"
          >
            {currentStage === stages.length - 1 ? 'Finish' : 'Next'}
            {currentStage !== stages.length - 1 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}



