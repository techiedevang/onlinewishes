import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface PerfumeDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function PerfumeDayView({ customization, onClose, isStandaloneView, isPreviewMode }: PerfumeDayViewProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const stages = ['greeting', 'message', 'floating_photos', 'poem', 'final'];

  useEffect(() => {
    if (stages[currentStage] === 'final' && !isPreviewMode) {
      const end = Date.now() + 3 * 1000;
      const colors = ['#ffb6c1', '#dda0dd', '#ff69b4'];
      
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
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl mb-6 drop-shadow-xl"
            >
              🌸
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-4 font-serif">
              {customization.recipientName || "Happy Perfume Day"}
            </h1>
            <h2 className="text-3xl md:text-4xl text-pink-600 font-serif">
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
            <Sparkles className="w-10 h-10 text-pink-400 mb-6" />
            <p className="text-2xl md:text-3xl text-pink-900 leading-relaxed font-serif whitespace-pre-wrap bg-white/40 p-8 rounded-3xl backdrop-blur-sm shadow-xl border border-pink-100">
              {customization.customParagraph || "You bring the sweetest fragrance to my life."}
            </p>
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
            <h2 className="text-3xl md:text-4xl text-pink-800 mb-10 font-serif">Sweet Memories</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {customization.memories.slice(0, 3).map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-pink-200 shadow-xl"
                >
                  <SafeImage
                    src={photo.imageUrl || ''} 
                    alt={`Memory ${index + 1}`}
                    className="w-full h-full object-cover"
                    fallbackUrl="https://images.unsplash.com/photo-1595425970377-c9703d74081b?q=80&w=400&auto=format&fit=crop"
                  />
                </motion.div>
              ))}
              {(!customization.memories || customization.memories.length === 0) && (
                 <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-pink-200 shadow-xl bg-pink-100 flex items-center justify-center text-pink-400"
                 >
                   <Heart size={48} />
                 </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 'poem':
        return (
          <motion.div
            key="poem"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto text-center"
          >
            <div className="bg-white/40 p-10 rounded-3xl backdrop-blur-sm shadow-xl border border-pink-100 relative">
              <div className="absolute -top-6 -left-6 text-5xl">✨</div>
              <p className="text-xl md:text-2xl text-pink-900 leading-loose font-serif italic whitespace-pre-wrap">
                {customization.customPoem || "Like a beautiful perfume,\nYour love lingers in my heart,\nSweet, delicate, and true,\nI cherish every part."}
              </p>
              <div className="absolute -bottom-6 -right-6 text-5xl">✨</div>
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
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-8"
            >
              💖
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-pink-800 mb-6 font-serif">
              Forever Yours
            </h2>
            <p className="text-2xl md:text-3xl text-pink-600 font-serif">
              {customization.senderName}
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-purple-100 overflow-hidden">
      {!isStandaloneView && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md transition-colors text-pink-900"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-10">
        <div className="w-[800px] h-[800px] rounded-full bg-pink-300 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {renderStage()}
          </AnimatePresence>
        </div>

        <div className="h-24 flex items-center justify-between px-6 md:px-12 bg-white/20 backdrop-blur-md border-t border-white/30">
          <button
            onClick={prevStage}
            disabled={currentStage === 0}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              currentStage === 0 
                ? 'opacity-0 cursor-default' 
                : 'bg-white/50 hover:bg-white/70 text-pink-900 shadow-sm'
            }`}
          >
            Back
          </button>
          
          <div className="flex gap-3">
            {stages.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStage ? 'bg-pink-600 w-8' : 'bg-pink-300 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentStage === stages.length - 1 ? onClose : nextStage}
            className="px-6 py-3 rounded-full font-medium bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-pink-500/50"
          >
            {currentStage === stages.length - 1 ? 'Finish' : 'Next'}
            {currentStage !== stages.length - 1 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}



