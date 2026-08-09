import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowRight, ArrowLeft, X, Clock, MailOpen, Quote } from 'lucide-react';
import { UserCustomization } from '../../types';
import { SafeImage } from '../SafeImage';
import confetti from 'canvas-confetti';

interface ValentineDayViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

type Stage = 'greeting' | 'love_letter' | 'anniversary_counter' | 'poem' | 'floating_photos' | 'group_wishes_wall' | 'final';

export function ValentineDayView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: ValentineDayViewProps) {
  const [stage, setStage] = useState<Stage>('greeting');
  const [daysTogether, setDaysTogether] = useState<number>(0);
  const [letterOpen, setLetterOpen] = useState(false);

  const stages: Stage[] = ['greeting', 'love_letter', 'anniversary_counter', 'poem', 'floating_photos', 'group_wishes_wall', 'final'];
  
  // Filter out stages if content is missing
  const activeStages = stages.filter(s => {
    if (s === 'anniversary_counter' && !customization.targetDate) return false;
    if (s === 'group_wishes_wall' && (!customization.groupWishes || customization.groupWishes.length === 0)) return false;
    return true;
  });

  const currentIndex = activeStages.indexOf(stage);

  useEffect(() => {
    if (customization.targetDate) {
      const target = new Date(customization.targetDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - target.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysTogether(diffDays);
    }
  }, [customization.targetDate]);

  useEffect(() => {
    if (stage === 'final') {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8B0000', '#FFD700', '#FF0000']
      });
    }
  }, [stage]);

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

  const safeMemories = customization.memories?.slice(0, 6) || [];
  const poemLines = (customization.customPoem || '').split('\n').filter(line => line.trim() !== '');

  return (
    <div className={`relative w-full h-full min-h-screen bg-gradient-to-br from-[#4A0000] via-[#8B0000] to-[#2D0000] text-[#FFF5F5] font-serif overflow-hidden flex flex-col ${isStandaloneView ? 'max-w-md mx-auto shadow-2xl' : ''}`}>
      
      {/* Floating Golden Hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xl text-[#FFD700]"
            initial={{ bottom: -30, left: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5 }}
            animate={{ bottom: '120%', left: `${Math.random() * 100}%`, rotate: 360 }}
            transition={{ duration: 15 + Math.random() * 15, repeat: Infinity, ease: 'linear', delay: Math.random() * 10 }}
          >
            ✧
          </motion.div>
        ))}
      </div>

      {onClose && (
        <div className="absolute top-4 left-4 z-50">
          <button onClick={onClose} className="p-2 bg-black/30 rounded-full backdrop-blur text-[#FFD700]">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 flex flex-col justify-center p-6 w-full h-full">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: Greeting */}
          {stage === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              className="text-center flex flex-col items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], filter: ['drop-shadow(0 0 10px #FFD700)', 'drop-shadow(0 0 30px #FFD700)', 'drop-shadow(0 0 10px #FFD700)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-8"
              >
                <Heart className="w-24 h-24 text-[#FFD700] fill-current" />
              </motion.div>
              <h1 className="text-5xl font-bold mb-6 text-[#FFD700] drop-shadow-lg tracking-wide border-b-2 border-[#FFD700] pb-4 inline-block px-4">
                Happy<br/>Valentine's<br/>Day
              </h1>
              <p className="text-3xl italic text-white/90 font-light mt-4">
                {customization.recipientName}
              </p>
            </motion.div>
          )}

          {/* STAGE 2: Love Letter */}
          {stage === 'love_letter' && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full flex flex-col items-center"
            >
              {!letterOpen ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLetterOpen(true)}
                  className="bg-[#D4AF37] w-64 h-48 rounded shadow-2xl relative flex items-center justify-center border border-[#AA8000] overflow-hidden"
                >
                  <MailOpen className="w-16 h-16 text-[#8B0000]" />
                  <span className="absolute bottom-4 text-[#8B0000] font-bold uppercase tracking-widest text-sm">Open My Letter</span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.8, type: 'spring' }}
                  className="bg-[#FFF8E7] text-[#4A0000] p-8 rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-sm border-2 border-[#D4AF37] relative"
                  style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #D4AF37 31px, #D4AF37 32px)', lineHeight: '32px', backgroundAttachment: 'local' }}
                >
                  <Quote className="absolute top-4 left-4 w-6 h-6 text-[#D4AF37]/50" />
                  <div className="pt-6 font-medium text-lg whitespace-pre-wrap">
                    {customization.customParagraph}
                  </div>
                  <div className="mt-8 text-right font-bold text-xl italic text-[#8B0000]">
                    Forever yours,<br/>{customization.senderName}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STAGE 3: Counter */}
          {stage === 'anniversary_counter' && (
            <motion.div
              key="counter"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm mx-auto text-center bg-black/40 p-8 rounded-2xl border border-[#FFD700]/30 backdrop-blur-sm"
            >
              <Clock className="w-12 h-12 text-[#FFD700] mx-auto mb-6" />
              <h3 className="text-2xl text-[#FFD700] mb-8 font-light uppercase tracking-widest">{customization.counterTitle || 'Time Together'}</h3>
              <div className="text-7xl font-bold text-white mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                {daysTogether}
              </div>
              <div className="text-xl text-[#FFD700]/80 tracking-widest uppercase">Beautiful Days</div>
              <p className="mt-8 text-white/70 italic">And counting every single second...</p>
            </motion.div>
          )}

          {/* STAGE 4: Poem */}
          {stage === 'poem' && (
            <motion.div
              key="poem"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm mx-auto bg-transparent border-x-4 border-[#FFD700] px-6 py-8"
            >
              <h3 className="text-[#FFD700] text-2xl text-center mb-8 italic">Verses For You</h3>
              <div className="space-y-6 text-center">
                {poemLines.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ delay: i * 0.6 }}
                    className="text-xl text-white font-medium drop-shadow-md"
                  >
                    {line}
                  </motion.p>
                ))}
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
              className="w-full h-full flex flex-col justify-center"
            >
              <h3 className="text-2xl text-center text-[#FFD700] mb-6 font-bold uppercase tracking-widest">Our Story</h3>
              <div className="flex overflow-x-auto pb-8 space-x-6 px-4 snap-x snap-mandatory hide-scrollbar">
                {safeMemories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="min-w-[280px] snap-center bg-black/50 p-3 rounded-xl border border-[#FFD700]/40 backdrop-blur-sm"
                  >
                    <div className="aspect-[4/5] relative rounded-lg overflow-hidden mb-4 border border-[#FFD700]/20">
                      <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl} alt={mem.caption} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white text-center italic px-2 text-sm">
                      {mem.caption}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 6: Group Wishes */}
          {stage === 'group_wishes_wall' && (
            <motion.div
              key="wishes"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm mx-auto"
            >
              <h3 className="text-2xl text-center text-[#FFD700] mb-8 font-bold">Love Notes</h3>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {customization.groupWishes?.map((wish, i) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/10 p-4 rounded-lg border-l-4 border-[#FFD700] backdrop-blur-sm"
                  >
                    <p className="text-white/90 italic mb-2 text-sm">"{wish.msg}"</p>
                    <p className="text-[#FFD700] text-right font-bold text-xs">— {wish.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 7: Final */}
          {stage === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center flex flex-col items-center justify-center h-full"
            >
              <Heart className="w-20 h-20 text-[#FFD700] fill-current mb-8 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                I Love You, <br/><span className="text-[#FFD700] italic">{customization.recipientName}</span>
              </h2>
              <p className="text-xl text-white/60 mt-8">
                Happy Valentine's Day ❤️
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="z-50 pb-8 pt-4 px-6 flex flex-col items-center space-y-4 w-full max-w-sm mx-auto">
        <div className="flex justify-between w-full">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-3 rounded-full flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/40 border border-[#FFD700]/30'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex space-x-2 items-center">
            {activeStages.map((s, idx) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[#FFD700] scale-150 shadow-[0_0_5px_#FFD700]' : 'bg-white/20'}`} />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeStages.length - 1}
            className={`p-3 rounded-full flex items-center justify-center transition-all ${currentIndex === activeStages.length - 1 ? 'opacity-0 pointer-events-none' : 'bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/40 border border-[#FFD700]/30'}`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {currentIndex < activeStages.length - 1 && (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA8000] text-[#4A0000] rounded-full font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all flex items-center justify-center space-x-2 uppercase tracking-widest"
          >
            <span>{stage === 'greeting' ? 'Begin Journey' : 'Next'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFD700; border-radius: 4px; }
      `}} />
    </div>
  );
}
