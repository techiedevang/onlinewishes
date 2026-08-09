import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface Props {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function KickDayView({ customization, onClose, isStandaloneView, isPreviewMode }: Props) {
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
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex flex-col items-center justify-center h-full space-y-6 text-center"
          >
            <motion.div
              animate={{ 
                x: [-20, 20, -20],
                rotate: [-15, 15, -15],
              }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-8xl"
            >
              🦵
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-[4px_4px_0_rgba(0,0,0,1)] italic">
              Kicking the negativity away!
            </h1>
            <motion.h2 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-3xl md:text-5xl text-black font-black bg-yellow-400 px-8 py-3 rounded-xl transform rotate-3 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
            >
              {customization.recipientName || 'Buddy'}
            </motion.h2>
          </motion.div>
        );

      case 'message':
        return (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6"
          >
            <div className="bg-red-500 p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative transform -rotate-1">
              <div className="absolute -top-8 -right-8 bg-yellow-400 p-4 rounded-full border-4 border-black">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <p className="text-xl md:text-3xl text-white font-black leading-snug text-center uppercase tracking-wide">
                {customization.customParagraph || "Time to kick start something new! Sending you this virtual kick to get you moving towards your goals. Let's go!"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl place-items-center">
              {[0, 1, 2, 3].map((index) => {
                const photoUrl = customization.memories[index];
                if (!photoUrl) return null;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100, y: 50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                  >
                    <div className={`p-4 ${index % 2 === 0 ? 'bg-yellow-400' : 'bg-white'} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg transform ${index % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
                      <SafeImage
                        src={photoUrl?.imageUrl || ''} fallbackUrl={photoUrl?.fallbackUrl || photoUrl?.imageUrl || ''}
                        alt={`Action Photo ${index + 1}`}
                        className="w-48 h-48 md:w-64 md:h-64 object-cover border-4 border-black filter contrast-125"
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
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6"
          >
            <div className="bg-white p-8 border-8 border-black text-center relative overflow-hidden transform rotate-1">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZWVlIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-20"></div>
              <p className="text-xl md:text-3xl text-black font-black whitespace-pre-wrap leading-relaxed relative z-10 uppercase">
                {customization.customPoem || "A kick of joy, a kick of fun,\nTo help you get your big tasks done.\nKick out the bad, keep all the good,\nAnd conquer life like you know you should!"}
              </p>
            </div>
          </motion.div>
        );

      case 'final':
        return (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="flex flex-col items-center justify-center h-full space-y-8 text-center"
            onAnimationComplete={() => {
              const end = Date.now() + 3 * 1000;
              const colors = ['#ef4444', '#facc15', '#000000']; // red, yellow, black

              (function frame() {
                confetti({
                  particleCount: 7,
                  angle: 60,
                  spread: 80,
                  origin: { x: 0 },
                  colors: colors
                });
                confetti({
                  particleCount: 7,
                  angle: 120,
                  spread: 80,
                  origin: { x: 1 },
                  colors: colors
                });

                if (Date.now() < end) {
                  requestAnimationFrame(frame);
                }
              }());
            }}
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"
              />
              <div className="text-8xl relative z-10 drop-shadow-[0_0_15px_rgba(255,255,0,0.8)]">🦵</div>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 uppercase tracking-tighter filter drop-shadow-[4px_4px_0_rgba(0,0,0,1)] italic">
              Happy Kick Day!
            </h2>
            
            <div className="bg-red-500 px-8 py-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
              <p className="text-2xl font-black text-white uppercase">
                From, <span className="text-yellow-300">{customization.senderName || 'Me'}</span>
              </p>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 overflow-hidden font-sans">
      {/* Halftone / comic action background */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', 
        backgroundPosition: '0 0, 10px 10px', 
        backgroundSize: '20px 20px' 
      }}></div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 bg-black text-white hover:bg-gray-800 rounded-full border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transition-all"
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
            className="group flex items-center space-x-3 bg-yellow-400 text-black px-10 py-4 rounded-xl font-black text-2xl uppercase border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all transform -skew-x-6"
          >
            <span>BAM! Next!</span>
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}



