import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface TeddyDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'greeting' | 'message' | 'floating_photos' | 'poem' | 'final';

export function TeddyDayView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: TeddyDayViewProps) {
  const [stage, setStage] = useState<Stage>('greeting');
  
  const safeMemories = (customization.memories || []).slice(0, 6);
  
  const STAGES: Stage[] = ['greeting', 'message', 'floating_photos', 'poem', 'final'];
  const currentIndex = STAGES.indexOf(stage);

  const nextStage = () => {
    if (currentIndex < STAGES.length - 1) {
      setStage(STAGES[currentIndex + 1]);
    }
  };

  useEffect(() => {
    if (stage === 'final') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#8B7355', '#FFB6C1', '#FFFAF0']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8B7355', '#FFB6C1', '#FFFAF0']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [stage]);

  const renderProgressDots = () => (
    <div className="flex gap-2 mt-8 z-20">
      {STAGES.map((s, idx) => (
        <div
          key={s}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            idx === currentIndex 
              ? 'bg-[#FFB6C1] scale-125' 
              : 'bg-[#8B7355]/50'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#5c4a37] via-[#8B7355] to-[#423528] text-white relative overflow-hidden font-sans">
      
      {/* Background Floating Teddies */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: Math.random() * window.innerWidth }}
            animate={{ 
              y: '-10vh',
              x: Math.random() * window.innerWidth,
              rotate: [-10, 10, -10]
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute text-3xl"
          >
            {i % 2 === 0 ? '🧸' : '✨'}
          </motion.div>
        ))}
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
        >
          <X className="w-6 h-6 text-white/80" />
        </button>
      )}

      <div className="max-w-md w-full px-6 flex flex-col items-center justify-center min-h-[80vh] z-10 relative">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: Greeting */}
          {stage === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center w-full"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="mb-8 flex justify-center text-7xl"
              >
                🧸
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[#FFFAF0]">
                A Virtual Hug For You
              </h1>
              <p className="text-2xl text-[#FFB6C1] font-light mb-12">
                {customization.recipientName}
              </p>
              
              <button
                onClick={nextStage}
                className="bg-[#FFB6C1] text-[#5c4a37] font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all mx-auto flex items-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Message */}
          {stage === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full bg-[#FFFAF0] text-[#5c4a37] p-8 rounded-[32px] border-4 border-[#8B7355] shadow-2xl relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl">🧸</div>
              <div className="mt-4 font-serif text-lg leading-relaxed whitespace-pre-line text-center">
                {customization.customParagraph || "Sending you the warmest and coziest hugs today and always. You mean the world to me."}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-[#8B7355] text-[#FFFAF0] font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Floating Photos */}
          {stage === 'floating_photos' && (
            <motion.div
              key="floating_photos"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-2xl font-serif text-[#FFFAF0] mb-6 text-center">Cozy Memories</h2>
              
              {safeMemories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  {safeMemories.map((mem, i) => (
                    <motion.div
                      key={mem.id || i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-[#FFFAF0] p-2 rounded-[24px] border-2 border-[#8B7355] shadow-lg transform rotate-[-2deg] even:rotate-[2deg]"
                    >
                      <div className="aspect-square relative rounded-[16px] overflow-hidden mb-2 bg-[#8B7355]/10">
                        <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl || mem.imageUrl} 
                          alt="Memory"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-center text-[#5c4a37] font-medium truncate px-1">
                        {mem.caption || 'Cute Moment'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/20 p-8 rounded-[32px] border-2 border-[#FFB6C1]/30 text-center mb-8 w-full">
                  <Sparkles className="w-8 h-8 text-[#FFB6C1] mx-auto mb-2" />
                  <p className="text-[#FFB6C1]">No cute photos added yet</p>
                </div>
              )}

              <button
                onClick={nextStage}
                className="bg-[#FFB6C1] text-[#5c4a37] font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STAGE 4: Poem */}
          {stage === 'poem' && (
            <motion.div
              key="poem"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-[#8B7355] text-[#FFFAF0] p-8 rounded-[32px] border-4 border-[#FFB6C1] shadow-2xl relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FFFAF0] p-3 rounded-full border-2 border-[#8B7355]">
                <Heart className="w-6 h-6 text-[#FFB6C1] fill-[#FFB6C1]" />
              </div>
              <div className="text-center font-serif text-lg leading-relaxed mt-4 whitespace-pre-line">
                {customization.customPoem || "Soft and cuddly, warm and sweet,\nA teddy bear hug is what you need.\nTo make you smile and feel so glad,\nThe best virtual hug you've ever had!"}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-[#FFFAF0] text-[#8B7355] font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                >
                  Final Surprise <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: Final */}
          {stage === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full flex flex-col items-center"
            >
              <motion.div
                initial={{ y: -50, scale: 0 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-8xl mb-6"
              >
                🧸
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#FFFAF0] mb-4">
                Happy Teddy Day 🧸
              </h2>
              <p className="text-2xl text-[#FFB6C1] font-light mb-8">
                {customization.recipientName}
              </p>
              
              <div className="bg-black/20 px-6 py-4 rounded-[20px] border border-[#FFB6C1]/30 backdrop-blur-sm">
                <p className="text-[#FFFAF0]">With endless hugs,</p>
                <p className="text-xl font-bold text-[#FFB6C1] mt-1">{customization.senderName}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {renderProgressDots()}
    </div>
  );
}
