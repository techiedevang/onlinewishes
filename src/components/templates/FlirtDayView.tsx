import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface FlirtDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function FlirtDayView({ customization, onClose, isStandaloneView, isPreviewMode }: FlirtDayViewProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const stages = ['greeting', 'message', 'floating_photos', 'poem', 'final'];

  useEffect(() => {
    if (stages[currentStage] === 'final' && !isPreviewMode) {
      const end = Date.now() + 3 * 1000;
      const colors = ['#ff0000', '#ff69b4', '#ff1493'];
      
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <motion.div
              animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl mb-8 drop-shadow-2xl"
            >
              😉
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-rose-800 mb-4 tracking-tight">
              {customization.recipientName || "Happy Flirt Day"}
            </h1>
            <h2 className="text-3xl md:text-4xl text-rose-600 font-semibold">
              {customization.recipientName}
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
            <Sparkles className="w-12 h-12 text-rose-400 mb-8 animate-pulse" />
            <div className="bg-white/60 p-8 rounded-3xl shadow-xl border-2 border-rose-200 transform rotate-1">
              <p className="text-2xl md:text-3xl text-rose-900 leading-relaxed font-medium whitespace-pre-wrap">
                {customization.customParagraph || "You always know how to make me smile..."}
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
            <h2 className="text-3xl md:text-4xl font-bold text-rose-800 mb-10">You & Me</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {customization.memories.slice(0, 3).map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, rotate: -20, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: index % 2 === 0 ? 5 : -5, scale: 1 }}
                  transition={{ delay: index * 0.2, type: "spring" }}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden border-8 border-white shadow-2xl"
                >
                  <SafeImage
                    src={photo.imageUrl || ''} 
                    alt={`Memory ${index + 1}`}
                    className="w-full h-full object-cover"
                    fallbackUrl="https://images.unsplash.com/photo-1518199268839-0d70bb777f9f?q=80&w=400&auto=format&fit=crop"
                  />
                </motion.div>
              ))}
              {(!customization.memories || customization.memories.length === 0) && (
                 <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden border-8 border-white shadow-2xl bg-rose-100 flex items-center justify-center text-rose-400"
                 >
                   <Heart size={48} className="animate-bounce" />
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
            <div className="bg-gradient-to-br from-white/80 to-white/40 p-10 rounded-3xl shadow-2xl border border-rose-200">
              <p className="text-xl md:text-2xl text-rose-950 leading-loose font-bold whitespace-pre-wrap">
                {customization.customPoem || "A cheeky smile, a playful wink,\nYou always know just what I think.\nLife's more fun when you're around,\nThe best distraction I have found!"}
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
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-7xl mb-8"
            >
              😘
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-rose-800 mb-6">
              Catch You Later!
            </h2>
            <p className="text-2xl md:text-3xl text-rose-600 font-medium">
              {customization.senderName}
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-tr from-rose-100 via-pink-100 to-red-50 overflow-hidden">
      {!isStandaloneView && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md transition-colors text-rose-900"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-300 to-pink-300 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {renderStage()}
          </AnimatePresence>
        </div>

        <div className="h-24 flex items-center justify-between px-6 md:px-12 bg-white/30 backdrop-blur-lg border-t border-white/40">
          <button
            onClick={prevStage}
            disabled={currentStage === 0}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              currentStage === 0 
                ? 'opacity-0 cursor-default' 
                : 'bg-white/60 hover:bg-white/80 text-rose-900 shadow-sm'
            }`}
          >
            Back
          </button>
          
          <div className="flex gap-2">
            {stages.map((_, idx) => (
              <div
                key={idx}
                className={`h-3 rounded-full transition-all duration-300 ${
                  idx === currentStage ? 'bg-rose-500 w-10' : 'bg-rose-200 w-3'
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentStage === stages.length - 1 ? onClose : nextStage}
            className="px-6 py-3 rounded-full font-bold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white flex items-center gap-2 transition-all shadow-xl hover:shadow-rose-500/50 transform hover:-translate-y-1"
          >
            {currentStage === stages.length - 1 ? 'Finish' : 'Next'}
            {currentStage !== stages.length - 1 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}



