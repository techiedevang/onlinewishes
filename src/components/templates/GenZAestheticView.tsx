import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Heart, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface GenZAestheticViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'intro' | 'bento' | 'message' | 'gallery' | 'final';

export function GenZAestheticView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: GenZAestheticViewProps) {
  const [stage, setStage] = useState<Stage>('intro');
  const safeMemories = (customization.memories || []).slice(0, 4);

  const STAGES: Stage[] = ['intro', 'bento', 'message', 'gallery', 'final'];
  const currentIndex = STAGES.indexOf(stage);

  const nextStage = () => {
    if (currentIndex < STAGES.length - 1) {
      setStage(STAGES[currentIndex + 1]);
    }
  };

  useEffect(() => {
    if (stage === 'final') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000', '#fff', '#e2e8f0']
      });
    }
  }, [stage]);

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 font-sans relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Soft Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-zinc-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-zinc-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 left-6 z-50 p-3 bg-white/50 backdrop-blur-md rounded-full border border-zinc-200 shadow-sm hover:bg-white/80 transition-all"
        >
          <X className="w-5 h-5 text-zinc-800" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center w-full max-w-lg z-10"
          >
            <div className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase bg-zinc-900 text-white rounded-full">
              For {customization.recipientName}
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight mb-8">
              A Vibe.<br/><span className="text-zinc-400 italic">Just for You.</span>
            </h1>
            <button
              onClick={nextStage}
              className="group flex items-center justify-center gap-2 mx-auto bg-white border border-zinc-200 shadow-lg text-zinc-900 font-medium px-8 py-4 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all w-full sm:w-auto"
            >
              Start Experience <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {stage === 'bento' && (
          <motion.div
            key="bento"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl z-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="sm:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-center">
              <h2 className="text-3xl font-heading font-bold mb-2">The Story</h2>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed line-clamp-3">
                {customization.customParagraph}
              </p>
            </div>

            <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center">
              <Star className="w-8 h-8 mb-4 text-zinc-400" />
              <div className="text-sm uppercase tracking-widest text-zinc-400 font-semibold mb-1">From</div>
              <div className="text-xl font-bold">{customization.senderName}</div>
            </div>

            {safeMemories[0] && (
              <div className="sm:col-span-3 h-64 bg-zinc-100 rounded-[2rem] overflow-hidden border border-zinc-200 shadow-sm relative group">
                <SafeImage
                  src={safeMemories[0].imageUrl}
                  fallbackUrl={safeMemories[0].fallbackUrl || safeMemories[0].imageUrl}
                  alt="Memory"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            <div className="sm:col-span-3 flex justify-end mt-4">
              <button
                onClick={nextStage}
                className="bg-zinc-900 text-white font-medium px-8 py-3 rounded-2xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] border border-zinc-200 shadow-xl z-10 text-center"
          >
            <h2 className="font-heading text-4xl font-bold mb-8">Thoughts</h2>
            <p className="text-xl sm:text-2xl text-zinc-600 leading-relaxed font-serif italic mb-10 whitespace-pre-line">
              "{customization.customPoem}"
            </p>
            <button
              onClick={nextStage}
              className="bg-zinc-100 text-zinc-900 font-medium px-8 py-3 rounded-2xl border border-zinc-200 hover:bg-zinc-200 transition-colors mx-auto flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {stage === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl z-10"
          >
            <h2 className="font-heading text-4xl font-bold text-center mb-8">Aesthetics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {safeMemories.map((mem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-[4/5] bg-zinc-200 rounded-3xl overflow-hidden relative group"
                >
                  <SafeImage
                    src={mem.imageUrl}
                    fallbackUrl={mem.fallbackUrl || mem.imageUrl}
                    alt="Memory"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium line-clamp-2">{mem.caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={nextStage}
                className="bg-zinc-900 text-white font-medium px-8 py-3 rounded-2xl hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                The End <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-md z-10 bg-white/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-zinc-200 shadow-2xl"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="font-heading text-4xl font-bold mb-4">You're the best.</h2>
            <p className="text-zinc-500 font-medium mb-8">
              Thanks for experiencing this vibe.
            </p>
            <div className="pt-8 border-t border-zinc-200">
              <p className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">From</p>
              <p className="text-xl font-bold text-zinc-900">{customization.senderName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
