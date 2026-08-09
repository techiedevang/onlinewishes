import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface MissingDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function MissingDayView({ customization, onClose, isStandaloneView, isPreviewMode }: MissingDayViewProps) {
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
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#6366f1', '#a855f7']
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-6xl"
            >
              💭
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {customization.recipientName ? `I Miss You, ${customization.recipientName}` : 'I Miss You So Much'}
            </h1>
            <p className="text-xl text-blue-100 italic">Thinking of you today...</p>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
          >
            <Sparkles className="text-blue-300 w-12 h-12" />
            <p className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
              {customization.customParagraph || "Distance means so little when someone means so much. I'm thinking of all our memories and wishing you were here."}
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
            <h2 className="text-3xl font-bold text-white drop-shadow-md">Nostalgic Moments</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl px-4">
              {customization.memories.slice(0, 3).map((photo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50, rotate: -10 + Math.random() * 20 }}
                  animate={{ opacity: 1, y: 0, rotate: -5 + Math.random() * 10 }}
                  transition={{ delay: idx * 0.2 }}
                  className="aspect-square rounded-lg overflow-hidden border-4 border-white shadow-xl bg-white/20"
                >
                  <SafeImage src={photo.imageUrl || ''} fallbackUrl={photo.fallbackUrl || photo.imageUrl || ''} alt={`Memory ${idx}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
              {(!customization.memories || customization.memories.length === 0) && (
                <div className="col-span-full text-center text-blue-200">
                  <p>Our beautiful memories belong here...</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 p-8 rounded-3xl backdrop-blur-sm border border-indigo-500/30"
          >
            <h3 className="text-2xl font-semibold text-blue-200 mb-4">A little thought</h3>
            <div className="space-y-4 text-xl text-white font-serif italic">
              <p>Every time my phone buzzes,</p>
              <p>I hope it's your name.</p>
              <p>Every beautiful sunset I see,</p>
              <p>I wish you were watching it too.</p>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-8"
          >
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-8 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
              <span className="text-6xl">💙</span>
            </div>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">Can't wait to see you again</h2>
            <p className="text-2xl text-blue-100">
              Love, {customization.senderName || 'Me'}
            </p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {onClose && !isStandaloneView && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
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
            className="group flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <span>{stage === totalStages - 1 ? 'Replay Magic' : 'Continue'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}


