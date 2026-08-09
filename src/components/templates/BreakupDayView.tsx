import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface BreakupDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function BreakupDayView({ customization, onClose, isStandaloneView, isPreviewMode }: BreakupDayViewProps) {
  const [stage, setStage] = useState(0);
  const totalStages = 5;

  const nextStage = () => {
    if (stage < totalStages - 1) {
      setStage(s => s + 1);
    } else {
      triggerConfetti();
      setStage(0);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#a78bfa', '#c084fc', '#9ca3af']
    });
  };

  const renderStage = () => {
    switch (stage) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-6xl"
            >
              🦋
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {customization.recipientName ? `Healing Journey, ${customization.recipientName}` : 'A New Beginning'}
            </h1>
            <p className="text-xl text-purple-100 italic">Every end is a new beginning...</p>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8 p-8 bg-white/5 backdrop-blur-lg rounded-3xl border border-purple-300/20"
          >
            <Sparkles className="text-purple-300 w-10 h-10" />
            <p className="text-2xl md:text-3xl font-light text-white leading-relaxed">
              {customization.customParagraph || "Sometimes things fall apart so better things can fall together. You are stronger than you know."}
            </p>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full space-y-8"
          >
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Finding Peace</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
              {customization.memories.slice(0, 3).map((photo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, filter: 'grayscale(100%)' }}
                  animate={{ opacity: 1, filter: 'grayscale(0%)' }}
                  transition={{ delay: idx * 0.4, duration: 1.5 }}
                  className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white/10 ring-1 ring-white/20"
                >
                  <SafeImage src={photo.imageUrl || ''} fallbackUrl={photo.fallbackUrl || photo.imageUrl || ''} alt={`Journey ${idx}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
              {(!customization.memories || customization.memories.length === 0) && (
                <div className="col-span-full text-center text-purple-200/60 p-8 border border-dashed border-purple-300/30 rounded-xl">
                  <p>Your beautiful moments of healing will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6"
          >
            <div className="space-y-6 text-xl md:text-2xl text-white/90 font-serif font-light leading-relaxed px-6 py-10 rounded-2xl bg-gradient-to-b from-transparent to-black/20">
              <p>"The wound is the place</p>
              <p>where the Light enters you."</p>
              <p className="text-sm mt-4 text-purple-200">— Rumi</p>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-8"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border-4 border-dashed border-purple-400/50 flex items-center justify-center p-2"
            >
              <div className="w-full h-full bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-5xl">✨</span>
              </div>
            </motion.div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg tracking-wide">Take Your Time</h2>
            <p className="text-xl text-purple-200 font-light">
              Wishing you strength, {customization.senderName || 'from a friend'}.
            </p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#1e1b4b] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#1e1b4b] to-black">
      {/* Muted magical particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-purple-300/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {onClose && !isStandaloneView && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-all border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="relative z-10 w-full h-full min-h-[100dvh] flex flex-col p-6">
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <React.Fragment key={stage}>
              {renderStage()}
            </React.Fragment>
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-8 flex justify-center pb-8">
          <button
            onClick={nextStage}
            className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-purple-100 rounded-full backdrop-blur-md border border-purple-500/30 transition-all duration-300"
          >
            <span className="font-medium tracking-wide">{stage === totalStages - 1 ? 'Start Over' : 'Next'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
}


