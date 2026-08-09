import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface KissDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'greeting' | 'love_letter' | 'poem' | 'floating_photos' | 'final';

export function KissDayView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: KissDayViewProps) {
  const [stage, setStage] = useState<Stage>('greeting');
  
  const safeMemories = (customization.memories || []).slice(0, 6);
  
  const STAGES: Stage[] = ['greeting', 'love_letter', 'poem', 'floating_photos', 'final'];
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
          colors: ['#7F1D1D', '#9F1239', '#fb7185', '#be123c']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7F1D1D', '#9F1239', '#fb7185', '#be123c']
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
              ? 'bg-rose-400 scale-125' 
              : 'bg-red-950/50'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-red-950 via-rose-900 to-black text-white relative overflow-hidden font-sans">
      
      {/* Background Floating Kisses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: Math.random() * window.innerWidth }}
            animate={{ 
              y: '-10vh',
              x: Math.random() * window.innerWidth,
              rotate: [-20, 20, -20]
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute text-3xl"
          >
            💋
          </motion.div>
        ))}
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
        >
          <X className="w-6 h-6 text-white/90" />
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
                animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-8 flex justify-center text-7xl"
              >
                💋
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-serif mb-4 text-rose-100 font-bold drop-shadow-lg">
                Sending Kisses Your Way
              </h1>
              <p className="text-2xl text-rose-300 font-light mb-12 italic">
                {customization.recipientName}
              </p>
              
              <button
                onClick={nextStage}
                className="bg-white text-rose-900 font-heading font-black uppercase px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all mx-auto flex items-center gap-2"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Love Letter */}
          {stage === 'love_letter' && (
            <motion.div
              key="love_letter"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-white text-stone-900 p-8 rounded-2xl border-4 border-rose-300 shadow-2xl relative"
            >
              <div className="absolute -top-6 -right-4 text-5xl rotate-[15deg] opacity-80">💋</div>
              <div className="absolute -bottom-4 -left-4 text-4xl rotate-[-20deg] opacity-60">💋</div>
              <div className="text-center font-serif text-lg leading-relaxed mt-4 whitespace-pre-line text-rose-950 font-medium">
                {customization.customParagraph || "Your kisses are the sweetest thing in my life. Every moment with you makes my heart skip a beat. I love you more than words can say."}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-rose-600 text-white font-heading font-black uppercase px-8 py-3 rounded-xl hover:bg-rose-700 hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Poem */}
          {stage === 'poem' && (
            <motion.div
              key="poem"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full bg-rose-950/80 backdrop-blur-sm text-rose-100 p-8 rounded-2xl border-2 border-rose-500 shadow-2xl relative"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500 opacity-50" />
              </div>
              <div className="text-center font-serif text-xl leading-relaxed mt-8 whitespace-pre-line italic">
                {customization.customPoem || "A kiss on the forehead is sweet,\nA kiss on the cheek is cute,\nBut a kiss on the lips from you,\nIs my favorite absolute."}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-rose-500 text-white font-heading font-black uppercase px-8 py-3 rounded-xl hover:bg-rose-400 hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                >
                  See Memories <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: Floating Photos */}
          {stage === 'floating_photos' && (
            <motion.div
              key="floating_photos"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-3xl font-serif text-rose-200 mb-6 text-center font-bold">Sweet Memories</h2>
              
              {safeMemories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  {safeMemories.map((mem, i) => (
                    <motion.div
                      key={mem.id || i}
                      initial={{ opacity: 0, rotate: Math.random() * 20 - 10 }}
                      animate={{ opacity: 1, rotate: i % 2 === 0 ? -3 : 3 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-2 rounded-xl border-4 border-rose-800 shadow-xl"
                    >
                      <div className="aspect-square relative rounded-lg overflow-hidden mb-2 bg-stone-100">
                        <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl || mem.imageUrl} 
                          alt="Memory"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-center text-rose-950 font-bold truncate px-1">
                        {mem.caption || 'Memory'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/10 p-8 rounded-2xl border-2 border-rose-500/50 text-center mb-8 w-full backdrop-blur-sm">
                  <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2 fill-rose-400 opacity-50" />
                  <p className="text-rose-200">Our memories will appear here</p>
                </div>
              )}

              <button
                onClick={nextStage}
                className="bg-white text-rose-900 font-heading font-black uppercase px-8 py-3 rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Final Surprise <Sparkles className="w-5 h-5 text-rose-500" />
              </button>
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
                animate={{ y: 0, scale: 1, rotate: [-10, 10, -10] }}
                transition={{ 
                  y: { type: "spring", bounce: 0.5 },
                  rotate: { repeat: Infinity, duration: 2, delay: 0.5 }
                }}
                className="text-8xl mb-6 drop-shadow-2xl"
              >
                💋
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 font-bold drop-shadow-lg">
                Happy Kiss Day
              </h2>
              <p className="text-2xl text-rose-200 font-light mb-8 italic">
                {customization.recipientName}
              </p>
              
              <div className="bg-gradient-to-r from-rose-900/80 to-red-900/80 px-8 py-5 rounded-2xl border-2 border-rose-500/50 backdrop-blur-md shadow-2xl">
                <p className="text-rose-200 font-medium">Sending endless kisses,</p>
                <p className="text-2xl font-bold text-white mt-2 font-serif">{customization.senderName}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {renderProgressDots()}
    </div>
  );
}
