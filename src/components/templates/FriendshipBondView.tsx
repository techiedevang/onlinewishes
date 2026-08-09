import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, ArrowRight, ArrowLeft, X, MessagesSquare, History } from 'lucide-react';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';
import confetti from 'canvas-confetti';

interface FriendshipBondViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'greeting' | 'friendship_quiz' | 'inside_jokes' | 'poem' | 'floating_photos' | 'nostalgic_timeline' | 'final';

export function FriendshipBondView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: FriendshipBondViewProps) {
  const [stage, setStage] = useState<Stage>('greeting');
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [flippedJokes, setFlippedJokes] = useState<Record<string, boolean>>({});

  const stages: Stage[] = ['greeting', 'friendship_quiz', 'inside_jokes', 'poem', 'floating_photos', 'nostalgic_timeline', 'final'];
  
  const activeStages = stages.filter(s => {
    if (s === 'inside_jokes' && (!customization.insideJokes || customization.insideJokes.length === 0)) return false;
    if (s === 'nostalgic_timeline' && (!customization.timelineEvents || customization.timelineEvents.length === 0)) return false;
    return true;
  });

  const currentIndex = activeStages.indexOf(stage);

  const handleNext = () => {
    if (currentIndex < activeStages.length - 1) {
      setStage(activeStages[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setStage(activeStages[currentIndex - 1]);
    }
  };

  useEffect(() => {
    if (stage === 'final') {
      const duration = 2000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F2C94C', '#FF8C42', '#4ADE80', '#A78BFA']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F2C94C', '#FF8C42', '#4ADE80', '#A78BFA']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [stage]);

  const toggleJoke = (id: string) => {
    setFlippedJokes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const safeMemories = customization.memories?.slice(0, 6) || [];
  const poemLines = (customization.customPoem || '').split('\n').filter(line => line.trim() !== '');
  const quizOptions = customization.quizOptions?.length ? customization.quizOptions : ['Always!', 'Sometimes 🙄', 'Never 🤫'];

  return (
    <div className={`relative w-full h-full min-h-screen bg-gradient-to-br from-[#F2C94C] to-[#FF8C42] text-gray-900 font-sans overflow-hidden flex flex-col ${isStandaloneView ? 'max-w-md mx-auto shadow-2xl' : ''}`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl rotate-12">🌟</div>
        <div className="absolute bottom-20 right-10 text-7xl -rotate-12">🍕</div>
        <div className="absolute top-1/2 left-4 text-5xl rotate-45">✨</div>
        <div className="absolute top-1/4 right-8 text-6xl -rotate-45">🔥</div>
      </div>

      <div className="absolute top-4 left-4 z-50">
        {onClose && (
          <button onClick={onClose} className="p-2 bg-white/30 rounded-full backdrop-blur hover:bg-white/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 flex flex-col justify-center items-center p-6 w-full h-full">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: Greeting */}
          {stage === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="text-center w-full"
            >
              <div className="flex justify-center space-x-4 mb-8">
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl">✌️</motion.div>
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }} className="text-6xl">🤪</motion.div>
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }} className="text-6xl">💖</motion.div>
              </div>
              
              <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border-4 border-dashed border-[#FF8C42] shadow-xl transform rotate-2">
                <h1 className="text-4xl font-black mb-4 text-[#FF8C42] uppercase tracking-wider">
                  BFF Forever!
                </h1>
                <div className="inline-block bg-[#4ADE80] text-white px-6 py-2 rounded-full font-bold text-2xl shadow-md -rotate-3 mt-2">
                  {customization.recipientName}
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: Quiz */}
          {stage === 'friendship_quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-[#4ADE80]"
            >
              <div className="flex justify-center -mt-12 mb-4">
                <div className="bg-[#4ADE80] p-4 rounded-full shadow-lg border-4 border-white">
                  <MessagesSquare className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                {customization.quizQuestion || 'Who takes longer to reply to texts?'}
              </h2>
              <div className="space-y-3">
                {quizOptions.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuizAnswered(true)}
                    className="w-full py-4 bg-gray-50 rounded-xl font-bold text-gray-700 hover:bg-[#4ADE80] hover:text-white transition-colors border-2 border-gray-200 hover:border-[#4ADE80]"
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
              
              <AnimatePresence>
                {quizAnswered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 bg-[#FF8C42]/20 p-4 rounded-xl text-center"
                  >
                    <p className="font-bold text-[#FF8C42]">{customization.quizBadgeText || 'Hahaha so true! 😂'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STAGE 3: Inside Jokes */}
          {stage === 'inside_jokes' && (
            <motion.div
              key="jokes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm grid grid-cols-2 gap-4"
            >
              <h3 className="col-span-2 text-center text-3xl font-black text-white drop-shadow-md mb-4 uppercase">Secret Files 🤫</h3>
              {customization.insideJokes?.map((joke, i) => (
                <div key={joke.id} className="relative h-40 perspective-1000">
                  <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: flippedJokes[joke.id] ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                    onClick={() => toggleJoke(joke.id)}
                  >
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg border-2 border-gray-200">
                      <div className="text-3xl mb-2">🎭</div>
                      <h4 className="font-bold text-gray-800 text-sm">{joke.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-2">Tap to reveal</p>
                    </div>
                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-[#A78BFA] rounded-2xl p-4 flex items-center justify-center text-center shadow-lg transform rotate-y-180 border-2 border-white">
                      <p className="text-white font-bold text-sm leading-tight">{joke.caption}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
              <style dangerouslySetInnerHTML={{__html: `
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
              `}} />
            </motion.div>
          )}

          {/* STAGE 4: Poem / Message */}
          {stage === 'poem' && (
            <motion.div
              key="poem"
              initial={{ opacity: 0, y: 50, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 2 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm bg-[#FEF3C7] p-8 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-8 flex space-x-4 px-4 pt-2 border-b border-red-300">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-blue-400" />
              </div>
              <div className="mt-6 space-y-4 font-[cursive] text-lg text-blue-900 leading-relaxed" style={{ backgroundImage: 'linear-gradient(transparent, transparent 27px, #93C5FD 27px, #93C5FD 28px)', lineHeight: '28px' }}>
                {poemLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#FF8C42] text-white px-4 py-1 rounded shadow transform -rotate-12 font-bold text-sm">
                From {customization.senderName}
              </div>
            </motion.div>
          )}

          {/* STAGE 5: Photos */}
          {stage === 'floating_photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col justify-center max-w-sm"
            >
              <h3 className="text-3xl font-black text-center text-white mb-6 drop-shadow-md">Core Memories</h3>
              <div className="grid grid-cols-2 gap-4">
                {safeMemories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className={`bg-white p-2 pb-6 shadow-xl relative ${i % 2 === 0 ? 'rotate-2' : '-rotate-2'} hover:rotate-0 transition-transform duration-300`}
                  >
                    <div className="aspect-square relative overflow-hidden mb-2">
                      <SafeImage src={mem.imageUrl} fallbackSrc={mem.fallbackUrl} alt={mem.caption} className="w-full h-full object-cover grayscale-0 hover:grayscale transition-all" />
                    </div>
                    <p className="text-gray-800 text-xs font-bold font-[cursive] text-center">{mem.caption}</p>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-red-400/50 rotate-3 shadow-sm" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 6: Timeline */}
          {stage === 'nostalgic_timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm h-full flex flex-col"
            >
              <h3 className="text-2xl font-black text-white text-center mb-6 flex items-center justify-center gap-2">
                <History className="w-6 h-6" /> The Eras Tour
              </h3>
              <div className="relative border-l-4 border-white/50 ml-4 space-y-6 flex-1 overflow-y-auto pr-4 pb-12 custom-scrollbar">
                {customization.timelineEvents?.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="relative pl-6"
                  >
                    <div className="absolute -left-[14px] top-1 w-6 h-6 bg-[#4ADE80] rounded-full border-4 border-white shadow-md" />
                    <div className="bg-white/90 p-4 rounded-xl shadow-lg border-2 border-white">
                      <span className="bg-[#A78BFA] text-white text-xs font-bold px-2 py-1 rounded inline-block mb-2">{event.year}</span>
                      <h4 className="font-bold text-gray-800 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 leading-snug">{event.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 7: Final */}
          {stage === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
              className="text-center flex flex-col items-center bg-white p-8 rounded-[3rem] shadow-2xl mx-4 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 text-8xl opacity-20">⭐</div>
              <div className="absolute -bottom-10 -left-10 text-8xl opacity-20">🌈</div>
              
              <Smile className="w-24 h-24 text-[#F2C94C] mb-6 relative z-10" />
              <h2 className="text-3xl font-black text-gray-800 mb-4 relative z-10 uppercase leading-tight">
                Friendships like ours are rare 💛
              </h2>
              <p className="text-lg font-bold text-gray-500 relative z-10">
                Love ya, {customization.senderName}
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <div className="z-50 pb-8 pt-4 px-6 flex flex-col items-center space-y-4 w-full max-w-sm mx-auto">
        <div className="flex justify-between w-full">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'bg-white/20 text-white hover:bg-white/40 shadow-sm'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex space-x-3 items-center">
            {activeStages.map((s, idx) => (
              <div key={s} className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30'}`} />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeStages.length - 1}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${currentIndex === activeStages.length - 1 ? 'opacity-0 pointer-events-none' : 'bg-white/20 text-white hover:bg-white/40 shadow-sm'}`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {currentIndex < activeStages.length - 1 && (
          <button
            onClick={handleNext}
            disabled={stage === 'friendship_quiz' && !quizAnswered}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-2 shadow-lg ${
              stage === 'friendship_quiz' && !quizAnswered
                ? 'bg-white/50 text-gray-500 cursor-not-allowed'
                : 'bg-white text-[#FF8C42] hover:bg-gray-50 hover:-translate-y-1'
            }`}
          >
            <span>{stage === 'greeting' ? 'Let\'s Go! 🚀' : 'Next ✨'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: white; border-radius: 4px; }
      `}} />
    </div>
  );
}
