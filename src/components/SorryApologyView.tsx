import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Volume2, VolumeX, Music, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, Send, Gift, Award, MessageCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserCustomization } from '../types';
import { SafeImage } from './SafeImage';
import { soundscapeEngine } from '../utils/soundscapes';

interface SorryApologyViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

export function SorryApologyView({
  customization,
  onClose,
  isStandaloneView = false,
  isPreviewMode = false,
}: SorryApologyViewProps) {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [openedEnvelopes, setOpenedEnvelopes] = useState<number[]>([]);
  const [checkedPromises, setCheckedPromises] = useState<number[]>([]);
  const [forgivenessLevel, setForgivenessLevel] = useState<number>(0); // 0, 50, 100
  const [noCount, setNoCount] = useState<number>(0);
  const [hasForgiven, setHasForgiven] = useState<boolean>(false);

  // Recipient label helper
  const recipientType = customization.apologyRecipientType || 'bestie';
  const getRecipientBadge = () => {
    switch (recipientType) {
      case 'girlfriend':
        return { label: 'To My Girlfriend / Love ❤️', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'boyfriend':
        return { label: 'To My Boyfriend / Partner 💖', bg: 'bg-pink-100 text-pink-800 border-pink-300' };
      case 'bestie':
        return { label: 'To My Bestie / Soulmate 👭', bg: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'friend':
        return { label: 'To My Dear Friend 🤝', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'sister':
        return { label: 'To My Sister / Family 🌸', bg: 'bg-teal-100 text-teal-800 border-teal-300' };
      default:
        return { label: 'To Someone Special ✨', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    }
  };

  const badgeInfo = getRecipientBadge();

  // Audio Handler
  const toggleSoundscape = () => {
    const active = soundscapeEngine.toggleSoundscape(customization.ambientSoundscape || 'rainy_cafe');
    setIsPlayingMusic(active);
  };

  // Evasive 'No' button dynamic phrases
  const noPhrases = [
    'No 🙈',
    'Are you sure? 🥺',
    'Pretty please? 👉👈',
    'I brought your favorite snack! 🍦',
    'Think of all our good memories! 💖',
    'Don\'t be cold! ❄️',
    'Okay fine, click YES! 🥰'
  ];

  const handleNoClick = () => {
    setNoCount((prev) => Math.min(prev + 1, noPhrases.length - 1));
  };

  const handleForgiveYes = () => {
    setHasForgiven(true);
    setForgivenessLevel(100);
    // Fire confetti blast
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#a855f7', '#fbbf24', '#10b981']
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch (e) {
      console.log('Confetti triggered');
    }
  };

  const toggleEnvelope = (idx: number) => {
    if (openedEnvelopes.includes(idx)) {
      setOpenedEnvelopes(openedEnvelopes.filter((i) => i !== idx));
    } else {
      setOpenedEnvelopes([...openedEnvelopes, idx]);
    }
  };

  const togglePromise = (idx: number) => {
    if (checkedPromises.includes(idx)) {
      setCheckedPromises(checkedPromises.filter((i) => i !== idx));
    } else {
      setCheckedPromises([...checkedPromises, idx]);
    }
  };

  // Default fallback data
  const letterTitle = customization.apologyLetterTitle || `I'm So Sorry, ${customization.recipientName || 'My Dear'} 🥺`;
  const letterBody = customization.apologyLetterBody || customization.customParagraph || `I hate that I upset you. You mean the world to me, and life feels incomplete when we aren't talking. Please read these promises and reasons straight from my heart.`;
  
  const defaultReasons = customization.apologyReasons?.length ? customization.apologyReasons : [
    { id: '1', title: 'Why I Am So Sorry 😔', note: 'I reacted without thinking, and I deeply regret causing you any pain or frustration.' },
    { id: '2', title: 'What You Mean To Me ✨', note: 'You are my safe place, my go-to person, and the one who makes everything brighter.' },
    { id: '3', title: 'What I Learned 💡', note: 'Your feelings always matter to me, and I will be more thoughtful and understanding.' },
    { id: '4', title: 'Why I Miss Us 💖', note: 'No joke is funny and no story is complete until I share it with you.' }
  ];

  const defaultPromises = customization.apologyPromises?.length ? customization.apologyPromises : [
    'I promise to listen to you with a calm and open heart.',
    'I promise to never take our bond or your kindness for granted.',
    'I promise to bring your favorite snack next time we meet 🍦',
    'I promise to always value our connection above any misunderstanding.'
  ];

  const memoriesList = customization.memories?.length ? customization.memories : [
    { id: '1', imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80', caption: 'Our happier days together 🌸', date: '' },
    { id: '2', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=800&q=80', caption: 'Laughter that fills my soul ✨', date: '' },
  ];

  const songName = customization.musicTrack || customization.spotifyTrackName || 'Soft Apology Melody 🎵';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/50 to-amber-50/30 text-slate-800 font-sans selection:bg-rose-200 relative overflow-x-hidden pb-20">
      
      {/* Top Floating Music & Navigation Bar */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between max-w-4xl mx-auto pointer-events-none">
        {onClose ? (
          <button
            onClick={onClose}
            className="pointer-events-auto bg-white/90 hover:bg-white text-slate-700 px-3 py-1.5 rounded-full border border-rose-200 shadow-md text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            <span>Back</span>
          </button>
        ) : <div />}

        {/* Music Player Button */}
        <button
          onClick={toggleSoundscape}
          className="pointer-events-auto bg-white/95 hover:bg-white text-rose-700 px-3.5 py-1.5 rounded-full border border-rose-200 shadow-lg text-xs font-bold flex items-center gap-2 transition-all active:scale-95 backdrop-blur-md"
        >
          {isPlayingMusic ? (
            <>
              <Volume2 className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className="truncate max-w-[120px] sm:max-w-[180px] text-[11px] font-medium">{songName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-600">Play Song 🎵</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Soft Hearts Background Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-200/40 text-lg sm:text-2xl"
            initial={{
              x: `${(i * 9) % 100}vw`,
              y: '105vh',
              scale: 0.6 + (i % 5) * 0.2,
              opacity: 0.3,
            }}
            animate={{
              y: '-10vh',
              rotate: i % 2 === 0 ? 360 : -360,
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 12 + (i % 6) * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.8,
            }}
          >
            {i % 3 === 0 ? '💖' : i % 3 === 1 ? '🌸' : '🥺'}
          </motion.div>
        ))}
      </div>

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 pt-16 sm:pt-20 space-y-8 sm:space-y-12">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${badgeInfo.bg}`}>
              <span>{badgeInfo.label}</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-serif font-black text-rose-950 tracking-tight leading-snug"
          >
            {letterTitle}
          </motion.h1>

          <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-md mx-auto leading-relaxed">
            From <span className="font-bold text-rose-700">{customization.senderName || 'Your Special Person'}</span> to <span className="font-bold text-rose-700">{customization.recipientName || 'You'}</span> — a sincere note from my heart.
          </p>

          {/* Hero Cover Photo / Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative w-full max-w-md mx-auto aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-rose-100"
          >
            <SafeImage
              src={customization.coverPhotoUrl || customization.heroPhotoUrl || memoriesList[0]?.imageUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80'}
              fallbackUrl="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80"
              alt="Apology Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
              <p className="text-xs font-semibold text-white/90 drop-shadow-md italic">
                "{memoriesList[0]?.caption || 'I treasure every moment we share together.'}"
              </p>
            </div>
          </motion.div>
        </section>

        {/* SINCERE HEARTFELT LETTER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-rose-200/80 shadow-xl relative overflow-hidden"
        >
          <div className="absolute -right-6 -bottom-6 text-7xl opacity-10 select-none">💌</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
              💌
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-rose-950">A Letter Straight From My Heart</h3>
              <p className="text-[11px] text-slate-500">Please read with an open mind...</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-rose-50/60 rounded-2xl border border-rose-200/60 text-slate-700 text-xs sm:text-sm font-serif leading-relaxed whitespace-pre-line">
            {letterBody}
          </div>

          {customization.customPoem && (
            <div className="mt-4 p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-center">
              <p className="font-serif italic text-xs sm:text-sm text-amber-900 leading-relaxed whitespace-pre-line">
                "{customization.customPoem}"
              </p>
            </div>
          )}
        </motion.section>

        {/* REASONS WHY I AM SORRY & WHY YOU MATTER (ORIGAMI ENVELOPES) */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-serif font-bold text-lg sm:text-2xl text-rose-950 flex items-center justify-center gap-2">
              <span>✉️</span>
              <span>Things I Want To Share With You</span>
            </h2>
            <p className="text-xs text-slate-500">Tap each envelope below to unlock my thoughts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {defaultReasons.map((reason, idx) => {
              const isOpen = openedEnvelopes.includes(idx);
              return (
                <motion.div
                  key={reason.id || idx}
                  onClick={() => toggleEnvelope(idx)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all shadow-sm ${
                    isOpen
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-2">
                      <span className="text-base">{isOpen ? '📂' : '✉️'}</span>
                      <span>{reason.title}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOpen ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isOpen ? 'Opened ✨' : 'Tap to Open'}
                    </span>
                  </div>

                  {isOpen ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-slate-700 font-medium leading-relaxed mt-2 pt-2 border-t border-rose-200/60"
                    >
                      {reason.note}
                    </motion.p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Click to reveal secret note #{idx + 1}...
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* PROMISES I MAKE TO YOU */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-pink-500/10 rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              🤝
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-rose-950">My Promises To You</h3>
              <p className="text-[11px] text-slate-500">Interactive checklist — tap to accept my vows</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {defaultPromises.map((promise, idx) => {
              const isChecked = checkedPromises.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => togglePromise(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isChecked ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 bg-slate-50'
                  }`}>
                    {isChecked ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] text-slate-400">#{idx + 1}</span>}
                  </div>
                  <span className="text-xs sm:text-sm leading-snug flex-1">
                    {promise}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* MEMORY PHOTO GALLERY */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-serif font-bold text-lg sm:text-2xl text-rose-950">
              📸 Moments That Remind Me Of Us
            </h2>
            <p className="text-xs text-slate-500">Looking back at all our happy times</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memoriesList.slice(0, 4).map((mem, idx) => (
              <motion.div
                key={mem.id || idx}
                whileHover={{ y: -4 }}
                className="bg-white p-3 rounded-2xl border border-rose-100 shadow-md space-y-2"
              >
                <div className="w-full h-44 rounded-xl overflow-hidden bg-rose-50 border border-slate-100">
                  <SafeImage
                    src={mem.imageUrl}
                    fallbackUrl="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80"
                    alt={mem.caption || `Memory ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {mem.caption && (
                  <p className="text-xs font-semibold text-rose-900 text-center px-1">
                    "{mem.caption}"
                  </p>
                )}
                {mem.backNote && (
                  <p className="text-[11px] italic text-slate-500 text-center px-1 border-t border-slate-100 pt-1">
                    {mem.backNote}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* FORGIVENESS METER & PLAYFUL 'WILL YOU FORGIVE ME?' BUTTON */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-rose-300 shadow-2xl text-center space-y-6 relative overflow-hidden"
        >
          <div className="space-y-2">
            <span className="text-4xl">🥺❤️</span>
            <h2 className="font-serif font-black text-xl sm:text-3xl text-rose-950">
              Will You Forgive Me?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              How are you feeling right now? Tap a level on the Forgiveness Meter below:
            </p>
          </div>

          {/* FORGIVENESS METER BUTTONS */}
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
            <button
              onClick={() => setForgivenessLevel(0)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                forgivenessLevel === 0 ? 'bg-rose-100 border-rose-400 text-rose-900 shadow-inner ring-2 ring-rose-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="block text-base mb-0.5">😤</span>
              <span>Still Mad</span>
              <span className="block text-[9px] opacity-75">0%</span>
            </button>

            <button
              onClick={() => setForgivenessLevel(50)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                forgivenessLevel === 50 ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-inner ring-2 ring-amber-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="block text-base mb-0.5">🥺</span>
              <span>Softening</span>
              <span className="block text-[9px] opacity-75">50%</span>
            </button>

            <button
              onClick={() => setForgivenessLevel(100)}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all ${
                forgivenessLevel === 100 ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-inner ring-2 ring-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="block text-base mb-0.5">🥰</span>
              <span>100% Ready</span>
              <span className="block text-[9px] opacity-75">100%</span>
            </button>
          </div>

          {/* Meter Status Note */}
          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium">
            {forgivenessLevel === 0 && "I completely understand... I'm so sorry. Take all the time you need 💔"}
            {forgivenessLevel === 50 && "Getting closer! Sending you a virtual cup of your favorite tea/coffee 🧋✨"}
            {forgivenessLevel === 100 && "Yay! You are ready to forgive! Click the big button below! 🫂💖"}
          </div>

          {/* PLAYFUL EVASIVE YES/NO BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* YES FORGIVE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForgiveYes}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-rose-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-current animate-pulse text-white" />
              <span>{customization.forgiveButtonText || 'YES, I Forgive You! 🫂❤️'}</span>
            </motion.button>

            {/* EVASIVE NO BUTTON */}
            {!hasForgiven && (
              <motion.button
                onClick={handleNoClick}
                whileHover={{ x: (noCount + 1) % 2 === 0 ? 15 : -15, y: -5 }}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer"
              >
                {noPhrases[noCount] || 'No 🙈'}
              </motion.button>
            )}
          </div>
        </motion.section>

        {/* FORGIVENESS CELEBRATION MODAL */}
        <AnimatePresence>
          {hasForgiven && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 border-4 border-rose-300 shadow-2xl relative overflow-hidden"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-4xl shadow-inner animate-bounce">
                  🫂
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif font-black text-2xl text-rose-950">
                    YOU FORGAVE ME! 🎉
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                    Thank you from the bottom of my heart. You are the absolute sweetest, most understanding person ever. I promise to cherish our bond forever! ❤️
                  </p>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs font-semibold text-rose-900">
                  Virtual Big Hug Delivered! 🧸✨
                </div>

                <button
                  onClick={() => setHasForgiven(false)}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  Close & Re-read Notes
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="text-center pt-8 border-t border-rose-200/60 space-y-2 text-slate-500 text-xs">
          <p className="font-medium">
            Created with sincere love by <span className="font-bold text-rose-700">{customization.senderName || 'Your Special Person'}</span>
          </p>
          <p className="text-[10px] text-slate-400">
            OnlineWishes.in • Digital Apology & Scrapbook Surprises
          </p>
        </footer>

      </main>
    </div>
  );
}
