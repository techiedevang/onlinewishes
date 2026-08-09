import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface Props {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function SlapDayView({ customization, onClose, isStandaloneView, isPreviewMode }: Props) {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    'greeting',
    'message',
    'floating_photos',
    'poem',
    'final'
  ];

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(prev => prev + 1);
    }
  };

  const renderStage = () => {
    const stage = stages[currentStage];
    
    switch (stage) {
      case 'greeting':
        return (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center justify-center h-full space-y-6 text-center"
          >
            <motion.div
              animate={{ rotate: [-10, 10, -10], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-8xl"
            >
              👋
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] comic-text">
              Time for a Reality Check!
            </h1>
            <h2 className="text-3xl md:text-4xl text-white font-bold bg-purple-600 px-6 py-2 rounded-xl transform -rotate-2 border-4 border-black">
              {customization.recipientName || 'Bestie'}
            </h2>
          </motion.div>
        );

      case 'message':
        return (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative">
              <div className="absolute -top-6 -left-6 text-5xl">💥</div>
              <p className="text-xl md:text-2xl text-gray-800 font-bold leading-relaxed text-center comic-text">
                {customization.customParagraph || "Here's a virtual slap to wake you up and remind you how awesome you are! Let's kick away all the laziness and rock this day!"}
              </p>
            </div>
          </motion.div>
        );

      case 'floating_photos':
        return (
          <motion.div
            key="floating_photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full p-4"
          >
            <h2 className="text-3xl font-black text-white mb-8 bg-blue-600 px-4 py-2 rounded-lg border-4 border-black transform rotate-2">
              Snapshots of Us!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl place-items-center">
              {[0, 1, 2, 3].map((index) => {
                const photoUrl = customization.memories[index];
                if (!photoUrl) return null;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0, rotate: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? -5 : 5 }}
                    transition={{ delay: index * 0.2, type: 'spring' }}
                    className="relative"
                  >
                    <div className="p-3 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                      <SafeImage
                        src={photoUrl?.imageUrl || ''} fallbackUrl={photoUrl?.fallbackUrl || photoUrl?.imageUrl || ''}
                        alt={`Photo ${index + 1}`}
                        className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-lg border-2 border-black"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'poem':
        return (
          <motion.div
            key="poem"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6"
          >
            <div className="bg-yellow-300 p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <Sparkles className="w-12 h-12 text-black" />
              </div>
              <p className="text-xl md:text-2xl text-black font-bold whitespace-pre-wrap leading-relaxed italic relative z-10">
                {customization.customPoem || "A playful slap to make you smile,\nTo cheer you up and change your style.\nWake up, gear up, and shine so bright,\nWith this virtual slap, make everything right!"}
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
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center justify-center h-full space-y-8 text-center"
            onAnimationComplete={() => {
              const end = Date.now() + 3 * 1000;
              const colors = ['#3b82f6', '#8b5cf6', '#ffffff'];

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
            }}
          >
            <div className="text-8xl">💥</div>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] comic-text">
              Happy Slap Day!
            </h2>
            <div className="bg-white px-8 py-4 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-bold text-gray-800">
                From, <span className="text-purple-600">{customization.senderName || 'Me'}</span>
              </p>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 overflow-hidden font-sans">
      {/* Comic book style dots background pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="absolute inset-0 flex items-center justify-center z-10 pt-16 pb-24 px-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {renderStage()}
        </AnimatePresence>
      </div>

      {currentStage < stages.length - 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50">
          <button
            onClick={handleNext}
            className="group flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-bold text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all"
          >
            <span>Next</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}



