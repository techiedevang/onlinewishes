import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles, CheckCircle, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface PromiseDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'greeting' | 'promises' | 'floating_photos' | 'message' | 'final';

export function PromiseDayView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: PromiseDayViewProps) {
  const [stage, setStage] = useState<Stage>('greeting');
  const [checkedPromises, setCheckedPromises] = useState<number[]>([]);
  
  const safeMemories = (customization.memories || []).slice(0, 6);
  const promisesList = (customization.quizOptions && customization.quizOptions.length > 0)
    ? customization.quizOptions
    : [
        { id: '1', text: 'I promise to always be there for you.' },
        { id: '2', text: 'I promise to hold your hand through tough times.' },
        { id: '3', text: 'I promise to make you smile every day.' },
        { id: '4', text: 'I promise to love you more tomorrow than today.' }
      ];
  
  const STAGES: Stage[] = ['greeting', 'promises', 'floating_photos', 'message', 'final'];
  const currentIndex = STAGES.indexOf(stage);

  const nextStage = () => {
    if (currentIndex < STAGES.length - 1) {
      setStage(STAGES[currentIndex + 1]);
    }
  };

  const togglePromise = (index: number) => {
    if (checkedPromises.includes(index)) {
      setCheckedPromises(checkedPromises.filter(i => i !== index));
    } else {
      setCheckedPromises([...checkedPromises, index]);
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
          colors: ['#0F766E', '#164E63', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0F766E', '#164E63', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [stage]);

  const renderProgressDots = () => (
    <div className="flex gap-2 mt-8 z-20 pb-4">
      {STAGES.map((s, idx) => (
        <div
          key={s}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            idx === currentIndex 
              ? 'bg-teal-300 scale-125' 
              : 'bg-teal-900/50'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-950 via-cyan-900 to-slate-950 text-white relative overflow-hidden font-sans">
      
      {/* Background Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: Math.random() * window.innerWidth }}
            animate={{ 
              y: '-10vh',
              x: Math.random() * window.innerWidth,
              rotate: 360 
            }}
            transition={{
              duration: Math.random() * 15 + 20,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute text-3xl"
          >
            ✨
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

      <div className="max-w-md w-full px-6 flex flex-col items-center justify-center min-h-[80vh] z-10 relative flex-1 pt-12">
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
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-8 flex justify-center text-7xl"
              >
                🤝
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-serif mb-4 text-teal-100">
                My Promise To You
              </h1>
              <p className="text-2xl text-teal-300 font-light mb-12">
                {customization.recipientName}
              </p>
              
              <button
                onClick={nextStage}
                className="bg-teal-600 text-white font-bold uppercase px-8 py-3 rounded-xl border-4 border-teal-800 shadow-[4px_4px_0px_rgba(15,118,110,0.5)] hover:translate-y-1 hover:shadow-none transition-all mx-auto flex items-center gap-2"
              >
                Tap to Open <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Promises Checklist */}
          {stage === 'promises' && (
            <motion.div
              key="promises"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-white/95 text-slate-900 p-6 md:p-8 rounded-2xl border-4 border-teal-500 shadow-2xl relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl bg-teal-100 rounded-full p-2 border-2 border-teal-500 shadow-sm">
                🤝
              </div>
              <h2 className="text-2xl font-serif text-teal-900 mb-6 text-center mt-4 border-b-2 border-teal-100 pb-4">
                Vows & Promises
              </h2>
              
              <div className="space-y-3 mb-8">
                {promisesList.map((promise, i) => {
                  const isChecked = checkedPromises.includes(i);
                  return (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => togglePromise(i)}
                      className={`p-3 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-colors ${
                        isChecked 
                          ? 'bg-teal-50 border-teal-500 shadow-sm' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle className={`w-5 h-5 ${isChecked ? 'text-teal-600' : 'text-slate-300'}`} />
                      </div>
                      <p className={`text-sm md:text-base ${isChecked ? 'text-teal-900 font-medium' : 'text-slate-600'}`}>
                        {typeof promise === 'string' ? promise : promise.text || promise}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-teal-600 text-white font-bold uppercase px-8 py-3 rounded-xl shadow-md hover:bg-teal-700 transition-colors flex items-center gap-2 w-full justify-center"
                >
                  Next <ArrowRight className="w-5 h-5" />
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
              <h2 className="text-2xl font-serif text-teal-200 mb-6 text-center">Promises Kept Together</h2>
              
              {safeMemories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  {safeMemories.map((mem, i) => (
                    <motion.div
                      key={mem.id || i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-2 rounded-xl border-2 border-teal-400 shadow-lg"
                    >
                      <div className="aspect-square relative rounded-lg overflow-hidden mb-2 bg-slate-100">
                        <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl || mem.imageUrl} 
                          alt="Memory"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/10 p-8 rounded-2xl border-2 border-teal-300/30 text-center mb-8 w-full">
                  <Sparkles className="w-8 h-8 text-teal-300 mx-auto mb-2" />
                  <p className="text-teal-200">No photos added yet</p>
                </div>
              )}

              <button
                onClick={nextStage}
                className="bg-teal-600 text-white font-bold uppercase px-8 py-3 rounded-xl border-4 border-teal-800 shadow-[4px_4px_0px_rgba(15,118,110,0.5)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
              >
                Open Letter <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STAGE 4: Message / Love Letter */}
          {stage === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-slate-100 text-slate-800 p-8 rounded-2xl border-4 border-teal-700 shadow-2xl relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-800 p-3 rounded-full border-2 border-teal-600 shadow-lg">
                <Mail className="w-6 h-6 text-teal-100" />
              </div>
              
              <div className="absolute top-4 right-4 opacity-20">
                <Sparkles className="w-8 h-8 text-teal-900" />
              </div>
              
              <div className="mt-6 font-serif text-lg leading-relaxed whitespace-pre-line text-slate-700 italic border-l-4 border-teal-500 pl-4">
                {customization.customParagraph || "I promise to stand by you in all of life's adventures, through every up and down. My word is my bond, and my heart is yours forever."}
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-teal-700 text-white font-bold uppercase px-8 py-3 rounded-xl shadow-lg hover:bg-teal-800 transition-all flex items-center gap-2"
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
                🤝
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
                Happy Promise Day
              </h2>
              <p className="text-2xl text-teal-300 font-light mb-8">
                {customization.recipientName}
              </p>
              
              <div className="bg-white/10 px-6 py-4 rounded-xl border border-teal-500/30 backdrop-blur-sm">
                <p className="text-teal-200">With all my love & promises,</p>
                <p className="text-xl font-bold text-white mt-1">{customization.senderName}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {renderProgressDots()}
    </div>
  );
}
