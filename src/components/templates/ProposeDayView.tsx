import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';

interface ProposeDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'greeting' | 'question' | 'poem' | 'floating_photos' | 'final';

export function ProposeDayView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: ProposeDayViewProps) {
  const [stage, setStage] = useState<Stage>('greeting');
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  
  const safeMemories = (customization.memories || []).slice(0, 6);
  
  const STAGES: Stage[] = ['greeting', 'question', 'poem', 'floating_photos', 'final'];
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
          colors: ['#ec4899', '#f43f5e', '#d946ef']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ec4899', '#f43f5e', '#d946ef']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [stage]);

  const handleAnswer = (opt: string) => {
    setAnsweredOption(opt);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ec4899', '#f43f5e', '#d946ef']
    });
  };

  const renderProgressDots = () => (
    <div className="flex gap-2 mt-8 z-20">
      {STAGES.map((s, idx) => (
        <div
          key={s}
          className={`w-3 h-3 rounded-full border-2 border-black transition-all ${
            idx === currentIndex 
              ? 'bg-white scale-125' 
              : 'bg-black/20'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 via-rose-500 to-red-400 text-black relative overflow-hidden font-sans">
      
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 bg-white rounded-full border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
        >
          <X className="w-6 h-6" />
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
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="mb-8 flex justify-center text-8xl"
              >
                💍
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-4 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                Will You Be Mine? 💍
              </h1>
              <p className="text-3xl font-bold mb-12 text-black bg-white inline-block px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {customization.recipientName}
              </p>
              
              <button
                onClick={nextStage}
                className="bg-lovely-neon text-white font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all mx-auto flex items-center gap-2"
              >
                Let's Find Out <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* STAGE 2: Question */}
          {stage === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-white text-black p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col items-center"
            >
              <h2 className="text-2xl font-black text-center mb-6">
                {customization.quizQuestion || "Will you be my Valentine?"}
              </h2>
              
              {!answeredOption ? (
                <div className="flex flex-col gap-3 w-full">
                  {(customization.quizOptions || ['Yes!', 'Maybe?', 'Still deciding...']).map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      className="bg-pink-100 hover:bg-pink-200 text-black font-bold py-3 px-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-1 hover:shadow-none w-full text-center"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-pink-600 mb-6">
                    {customization.quizBadgeText || "YES! I knew it! 🎉"}
                  </h3>
                  <button
                    onClick={nextStage}
                    className="bg-lovely-neon text-white font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STAGE 3: Poem */}
          {stage === 'poem' && (
            <motion.div
              key="poem"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-pink-100 text-stone-900 p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
            >
              <div className="text-center font-bold text-lg leading-relaxed mt-4 whitespace-pre-line text-black">
                {customization.customPoem ? (
                  customization.customPoem.split('\n').map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.3 }}
                    >
                      {line}
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    I love you more than words can say,<br/>
                    Will you be mine this special day?
                  </motion.div>
                )}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextStage}
                  className="bg-lovely-neon text-white font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: Floating Photos */}
          {stage === 'floating_photos' && (
            <motion.div
              key="floating_photos"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-3xl font-black text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-6 text-center">
                Our Memories
              </h2>
              
              {safeMemories.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  {safeMemories.map((mem, i) => (
                    <motion.div
                      key={mem.id || i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-2 rounded-xl border-4 border-pink-500 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform"
                    >
                      <div className="aspect-square relative rounded-lg overflow-hidden mb-2 bg-stone-100 border-2 border-black">
                        <SafeImage 
                          src={mem.imageUrl} 
                          alt="Memory"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-center font-bold text-black truncate px-1">
                        {mem.caption || 'Memory'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/90 p-8 rounded-2xl border-4 border-black text-center mb-8 w-full shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="font-bold">No photos added yet</p>
                </div>
              )}

              <button
                onClick={nextStage}
                className="bg-lovely-neon text-white font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
              >
                Finish <ArrowRight className="w-5 h-5" />
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
                animate={{ y: 0, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-8xl mb-6 drop-shadow-2xl"
              >
                💍
              </motion.div>
              <h2 className="text-5xl font-black text-white mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                You Said Yes! 💍
              </h2>
              <p className="text-3xl font-bold mb-8 text-black bg-white inline-block px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {customization.recipientName}
              </p>
              
              <div className="bg-white px-6 py-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] mt-4 transform rotate-[-2deg]">
                <p className="font-bold text-lg">With all my love,</p>
                <p className="text-2xl font-black text-pink-600 mt-1">{customization.senderName}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {renderProgressDots()}
    </div>
  );
}
