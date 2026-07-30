import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, PartyPopper, Heart, ArrowRight, Sparkles, Smile, RefreshCw, Volume2, VolumeX, Music, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Memory, UserCustomization } from '../types';
import { INITIAL_MEMORIES_21 } from '../data/templates';
import Book from './Book';
import { SafeImage } from './SafeImage';
import { SparkleParticleCanvas } from './SparkleParticleCanvas';
import { soundscapeEngine } from '../utils/soundscapes';

export type Stage = 'passcode' | 'greeting' | 'question' | 'no_error' | 'paragraph' | 'poem' | 'gift_box' | 'floating_photos' | 'collage' | 'book' | 'final' | 'love_letter' | 'birthday_cake' | 'polaroid_wall' | 'arcade_screen' | 'gratitude_tree' | 'celestial_wishes' | 'editorial_gallery' | 'vintage_letter' | 'anniversary_counter' | 'friendship_quiz' | 'inside_jokes' | 'downloadable_poster' | 'nostalgic_timeline' | 'gratitude_cards' | 'sisterhood_oath' | 'high_res_export' | 'birthday_countdown' | 'interactive_candles' | 'group_wishes_wall' | 'confetti_burst' | 'arcade_level_quest' | 'arcade_pixel_cards' | 'arcade_high_score' | 'star_constellations' | 'shooting_star_wish' | 'editorial_cover' | 'editorial_story' | 'vintage_botanical_gallery';

interface InteractiveSurpriseTemplateProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
}

// Helper to compute Spotify embed link
const getMediaEmbedUrl = (url?: string) => {
  if (!url) return null;
  try {
    if (url.includes('spotify.com') || url.startsWith('spotify:')) {
      let type = '';
      let id = '';
      if (url.startsWith('spotify:')) {
        const parts = url.split(':');
        if (parts.length >= 3) { type = parts[1]; id = parts[2]; }
      } else {
        const match = url.match(/(track|playlist|album|episode|show|artist)\/([a-zA-Z0-9]+)/);
        if (match) { type = match[1]; id = match[2]; }
      }
      if (type && id) {
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      }
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:v=|youtu\.be\/)([\w-]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}?autoplay=1&loop=1&playlist=${match[1]}`;
      }
    }
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    }
  } catch (e) {
    console.error('Failed to parse Media URL:', e);
  }
  return url.startsWith('http') ? url : null;
};

// Helper for dynamic theme styling
const getThemeConfig = (themeKey?: string, occasion?: string) => {
  const key = themeKey || occasion;
  switch (key) {
    case 'romantic-love-story':
    case 'anniversary':
    case 'girlfriend':
    case 'sunset':
      return {
        greetingBg: 'bg-gradient-to-br from-rose-950 via-red-900 to-amber-950 text-white',
        cardBg: 'bg-red-950/90 text-rose-100 border border-red-800/80 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50',
        titleFont: 'font-serif',
        primaryText: 'text-rose-100',
        subText: 'text-amber-200',
        stageGradients: 'bg-gradient-to-br from-rose-950 via-red-950 to-stone-950',
        icon: '❤️',
      };
    case 'bestie-chaos-polaroid':
    case 'bestie':
    case 'friendship':
    case 'purple':
      return {
        greetingBg: 'bg-gradient-to-br from-purple-950 via-fuchsia-900 to-indigo-950 text-white',
        cardBg: 'bg-purple-950/90 text-purple-100 border-2 border-fuchsia-500 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-black shadow-fuchsia-900/50',
        titleFont: 'font-mono',
        primaryText: 'text-fuchsia-200',
        subText: 'text-purple-300',
        stageGradients: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950',
        icon: '🦄',
      };
    case 'sisterhood-gratitude-tree':
    case 'sister':
    case 'warm_amber':
      return {
        greetingBg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 text-amber-100',
        cardBg: 'bg-amber-950/90 text-amber-100 border border-amber-700/60 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-amber-900/50',
        titleFont: 'font-serif',
        primaryText: 'text-amber-200',
        subText: 'text-orange-200',
        stageGradients: 'bg-gradient-to-br from-amber-950 via-stone-900 to-orange-950',
        icon: '🌳',
      };
    case 'birthday-confetti-party':
    case 'birthday':
    case 'confetti_sky':
      return {
        greetingBg: 'bg-gradient-to-br from-sky-950 via-indigo-950 to-purple-950 text-white',
        cardBg: 'bg-slate-900/90 text-sky-100 border-2 border-sky-400 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-extrabold',
        titleFont: 'font-sans font-black',
        primaryText: 'text-sky-200',
        subText: 'text-indigo-200',
        stageGradients: 'bg-gradient-to-br from-sky-950 via-indigo-950 to-slate-950',
        icon: '🎉',
      };
    case 'wedding':
      return {
        greetingBg: 'bg-gradient-to-br from-stone-100 via-rose-50 to-white text-stone-800',
        cardBg: 'bg-white/90 text-stone-800 border-2 border-rose-200 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-stone-800 hover:bg-stone-700 text-rose-100 font-serif shadow-stone-900/20',
        titleFont: 'font-serif tracking-widest',
        primaryText: 'text-stone-800',
        subText: 'text-stone-500',
        stageGradients: 'bg-gradient-to-br from-stone-50 via-rose-50 to-stone-100',
        icon: '💍',
      };
    case 'retro-90s-arcade':
    case 'pixel':
      return {
        greetingBg: 'bg-black text-emerald-400 border-4 border-emerald-500 font-mono',
        cardBg: 'bg-slate-950 text-emerald-400 border-2 border-emerald-500 shadow-emerald-950/50 font-mono',
        accentBtn: 'bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider',
        titleFont: 'font-mono uppercase',
        primaryText: 'text-emerald-300',
        subText: 'text-emerald-500',
        stageGradients: 'bg-black text-emerald-400 font-mono',
        icon: '👾',
      };
    case 'celestial-galaxy':
    case 'starry':
      return {
        greetingBg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-indigo-100',
        cardBg: 'bg-slate-950/90 text-indigo-100 border border-indigo-500/40 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-indigo-900/50',
        titleFont: 'font-sans tracking-wide',
        primaryText: 'text-indigo-200',
        subText: 'text-purple-300',
        stageGradients: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900',
        icon: '🌌',
      };
    case 'minimalist-editorial':
    case 'minimal':
      return {
        greetingBg: 'bg-stone-950 text-stone-100',
        cardBg: 'bg-stone-900 text-stone-100 border border-stone-800 shadow-2xl',
        accentBtn: 'bg-stone-100 hover:bg-white text-stone-950 font-bold uppercase tracking-widest',
        titleFont: 'font-serif tracking-tight',
        primaryText: 'text-stone-200',
        subText: 'text-stone-400',
        stageGradients: 'bg-stone-950 text-stone-100',
        icon: '✨',
      };
    case 'vintage-parchment':
    case 'vintage':
      return {
        greetingBg: 'bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-200',
        cardBg: 'bg-amber-900/80 text-amber-100 border-2 border-amber-600/50 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-serif',
        titleFont: 'font-serif italic',
        primaryText: 'text-amber-200',
        subText: 'text-amber-300',
        stageGradients: 'bg-gradient-to-br from-amber-950 via-stone-950 to-amber-900',
        icon: '📜',
      };
    default:
      // Default Pink / Box21 Classic
      return {
        greetingBg: 'bg-gradient-to-br from-pink-500 via-rose-500 to-amber-400 text-white',
        cardBg: 'bg-white/95 text-slate-800 border border-rose-200 shadow-2xl backdrop-blur-md',
        accentBtn: 'bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-rose-500/30',
        titleFont: 'font-sans',
        primaryText: 'text-slate-800',
        subText: 'text-rose-600',
        stageGradients: 'bg-gradient-to-br from-pink-100 via-rose-50 to-amber-100',
        icon: '🎁',
      };
  }
};

export function InteractiveSurpriseTemplate({
  customization,
  onClose,
  isStandaloneView = false,
}: InteractiveSurpriseTemplateProps) {
  const [quizAnswered, setQuizAnswered] = useState(false);
  
  // Enable passcode gate for any template theme if enabled in customization
  const shouldShowPasscode = Boolean(customization.enablePasscode) && Boolean(customization.secretPasscode);

  const [rawStage, setRawStage] = useState<Stage>(
    shouldShowPasscode ? 'passcode' : 'greeting'
  );

  const setStage = (newStage: Stage) => {
    setRawStage(newStage);
    window.history.pushState({ stage: newStage }, "", "");
  };

  const stage = rawStage;

  useEffect(() => {
    // Initialize history state on mount
    window.history.replaceState({ stage: rawStage }, "", "");
    
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.stage) {
        setRawStage(e.state.stage);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const themeConfig = getThemeConfig(customization.bgTheme, customization.occasion);
  const safeMemories = [...(customization.memories || [])];

  const spotifyEmbedUrl = getMediaEmbedUrl(customization.spotifyTrackUrl);

  // Auto-play ambient soundscape when scrapbook is opened or experience starts
  useEffect(() => {
    if (stage === 'passcode') return; // Don't play music until unlocked

    const selectedTrack = customization.ambientSoundscape || 'rainy_cafe';
    if (selectedTrack !== 'none' && !audioMuted) {
      soundscapeEngine.play(selectedTrack);
    } else {
      soundscapeEngine.stop();
    }

  
  

  return () => {
      soundscapeEngine.stop();
    };
  }, [stage, customization.ambientSoundscape, audioMuted]);

  useEffect(() => {
    soundscapeEngine.setMuted(audioMuted);
  }, [audioMuted]);

  // Play Spotify Preview Audio if available
  useEffect(() => {
    let previewAudio: HTMLAudioElement | null = null;
    if (stage !== 'passcode' && customization.spotifyPreviewUrl && !audioMuted) {
      previewAudio = new Audio(customization.spotifyPreviewUrl);
      previewAudio.loop = true;
      previewAudio.play().catch(e => console.log('Preview audio autoplay blocked:', e));
    }
    return () => {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
    };
  }, [stage, customization.spotifyPreviewUrl, audioMuted]);





  const [generatedWish, setGeneratedWish] = useState("");
  const wishes = [
    "May your joy shine as bright as the North Star.",
    "Wishing you a universe of happiness and love.",
    "May your dreams take flight like a shooting star.",
    "You are my sun, my moon, and all my stars.",
    "Hope your year is out of this world!"
  ];

  const generateWish = () => {
    setGeneratedWish(wishes[Math.floor(Math.random() * wishes.length)]);
  };

  const [countdown, setCountdown] = useState(3);
  
  useEffect(() => {
    if (stage === 'birthday_countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [stage, countdown]);

  const [micListening, setMicListening] = useState(false);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicListening(true);
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      scriptProcessor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += (array[i]);
        }
        const average = values / length;
        
        if (average > 50) { // Blow threshold
          const flames = document.querySelectorAll('.flame');
          let blown = 0;
          flames.forEach(f => {
             f.classList.add('hidden');
          });
          if (flames.length > 0) {
            scriptProcessor.disconnect();
            microphone.disconnect();
            setTimeout(handleNextStage, 1000);
          }
        }
      };
    } catch (err) {
      console.error('Mic error:', err);
      // Fallback
      const flames = document.querySelectorAll('.flame');
      flames.forEach(f => f.classList.add('hidden'));
      setTimeout(handleNextStage, 1000);
    }
  };

  const handleNextStage = () => {
    const key = customization.bgTheme || customization.occasion;
    if (['sunset', 'romantic-love-story', 'anniversary', 'girlfriend'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('anniversary_counter');
      else if (stage === 'anniversary_counter') setStage('love_letter');
      else if (stage === 'love_letter') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['confetti_sky', 'birthday-confetti-party', 'birthday'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('birthday_countdown');
      else if (stage === 'birthday_countdown') setStage('interactive_candles');
      else if (stage === 'interactive_candles') setStage('confetti_burst');
      else if (stage === 'confetti_burst') setStage('group_wishes_wall');
      else if (stage === 'group_wishes_wall') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['amber', 'orange', 'sisterhood-gratitude-tree', 'sister'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('nostalgic_timeline');
      else if (stage === 'nostalgic_timeline') setStage('gratitude_cards');
      else if (stage === 'gratitude_cards') setStage('sisterhood_oath');
      else if (stage === 'sisterhood_oath') setStage('high_res_export');
      else if (stage === 'high_res_export') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['purple', 'bestie-chaos-polaroid', 'bestie'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('polaroid_wall');
      else if (stage === 'polaroid_wall') setStage('inside_jokes');
      else if (stage === 'inside_jokes') setStage('friendship_quiz');
      else if (stage === 'friendship_quiz') setStage('downloadable_poster');
      else if (stage === 'downloadable_poster') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['pixel', 'retro-90s-arcade'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('arcade_screen');
      else if (stage === 'arcade_screen') setStage('arcade_level_quest');
      else if (stage === 'arcade_level_quest') setStage('arcade_pixel_cards');
      else if (stage === 'arcade_pixel_cards') setStage('arcade_high_score');
      else if (stage === 'arcade_high_score') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['celestial-galaxy', 'starry'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('star_constellations');
      else if (stage === 'star_constellations') setStage('shooting_star_wish');
      else if (stage === 'shooting_star_wish') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['minimalist-editorial', 'minimal'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('editorial_cover');
      else if (stage === 'editorial_cover') setStage('editorial_gallery');
      else if (stage === 'editorial_gallery') setStage('editorial_story');
      else if (stage === 'editorial_story') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else if (['vintage-parchment', 'vintage'].includes(key)) {
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('vintage_letter');
      else if (stage === 'vintage_letter') setStage('vintage_botanical_gallery');
      else if (stage === 'vintage_botanical_gallery') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
    else {
      // Default Box21
      if (stage === 'passcode') setStage('greeting');
      else if (stage === 'greeting') setStage('question');
      else if (stage === 'question') setStage('paragraph');
      else if (stage === 'no_error') setStage('question');
      else if (stage === 'paragraph') setStage('poem');
      else if (stage === 'poem') setStage('gift_box');
      else if (stage === 'gift_box') setStage('floating_photos');
      else if (stage === 'floating_photos') setStage('collage');
      else if (stage === 'collage') setStage('book');
      else if (stage === 'book') setStage('final');
      else setStage('final');
    }
  };

  // Trigger confetti burst on gift box open or collage view
  const triggerConfetti = (multi = false) => {
    if (multi) {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  useEffect(() => {
    if (stage === 'greeting' && customization.confettiOnLoad && isStandaloneView) {
      triggerConfetti();
    }
  }, [stage, customization.confettiOnLoad, isStandaloneView]);

  return (
    <div className="relative w-full h-full bg-slate-900 text-slate-800 font-sans overflow-hidden flex flex-col justify-between select-none">
      
      {/* Top Header Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
        {onClose ? (
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 transition-colors"
            aria-label="Exit Preview"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            <span>Close Preview</span>
          </button>
        ) : <div />}

        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow text-slate-700 dark:text-slate-200 hover:text-rose-500 transition-colors"
            aria-label={audioMuted ? "Unmute Ambient Music" : "Mute Ambient Music"}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Recipient Badge */}
          <div className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow">
            For {customization.recipientName || 'Bestie'} ❤️
          </div>
        </div>
      </div>

      {/* Sparkle Particle Overlay */}
      <SparkleParticleCanvas particleDensity={1.2} />

      {/* Main Interactive Stage Container */}
      <div className="relative w-full h-full flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          
          {/* 0. PASSCODE STAGE */}
          {stage === 'passcode' && (
            <motion.div
              key="passcode"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${themeConfig.greetingBg} z-20 pointer-events-auto`}
            >
              <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6 border border-white/10">
                <Lock className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Secret Scrapbook
                </h2>
                <p className="text-slate-300 text-sm">
                  Please enter the passcode to unlock this surprise.
                </p>
                {customization.passcodeHint && (
                  <div className="bg-rose-500/20 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 font-medium flex items-center justify-center space-x-1.5 shadow-xs">
                    <span className="text-base shrink-0">💡</span>
                    <span className="leading-snug">{customization.passcodeHint}</span>
                  </div>
                )}
                <div className="space-y-4">
                  <input
                    type="password"
                    value={passcodeAttempt}
                    onChange={(e) => {
                      setPasscodeAttempt(e.target.value);
                      setPasscodeError(false);
                    }}
                    placeholder="Enter Passcode"
                    className="w-full text-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (passcodeAttempt === customization.secretPasscode || passcodeAttempt === '2024') { handleNextStage(); } else {
                          setPasscodeError(true);
                        }
                      }
                    }}
                  />
                  {passcodeError && (
                    <p className="text-rose-400 text-xs font-bold animate-pulse">Incorrect passcode</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (passcodeAttempt === customization.secretPasscode || passcodeAttempt === '2024') { handleNextStage(); } else {
                        setPasscodeError(true);
                      }
                    }}
                    className="w-full px-6 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-all transform hover:scale-105"
                  >
                    Unlock
                  </button>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleNextStage()}
                      className="text-[11px] text-slate-400 hover:text-white underline font-medium"
                    >
                      (Preview Mode: Click to Quick Unlock - Code: {customization.secretPasscode || '2024'})
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 1. GREETING STAGE */}
          {stage === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              onClick={handleNextStage}
              className={`absolute inset-0 flex flex-col items-center justify-center p-6 cursor-pointer ${themeConfig.greetingBg} text-center`}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 mb-6"
              >
                <span className="text-5xl">{themeConfig.icon}</span>
              </motion.div>
              
              <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 ${themeConfig.titleFont} ${themeConfig.primaryText}`}>
                Hey {customization.recipientName || 'Bestie'}! ✨
              </h1>
              <p className={`text-base sm:text-xl font-semibold mb-8 max-w-md ${themeConfig.subText}`}>
                I built a special surprise website just for you...
              </p>

              <div className={`px-6 py-3 font-bold rounded-full shadow-lg transition-colors flex items-center space-x-2 text-sm sm:text-base ${themeConfig.accentBtn}`}>
                <span>Tap Anywhere to Open</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* 2. QUESTION STAGE */}
          {stage === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-rose-100/90 z-10"
            >
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6">
                <Smile className="w-16 h-16 text-rose-500 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Are you ready to see your surprise?
                </h2>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => { const key = customization.bgTheme || customization.occasion; if (['sunset', 'confetti_sky', 'purple', 'pixel'].some(k => key.includes(k))) handleNextStage(); else setStage('paragraph'); }}
                    className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-all transform hover:scale-105"
                  >
                    YES! 😍
                  </button>
                  <button
                    onClick={() => setStage('no_error')}
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl shadow-md hover:bg-slate-300 transition-all"
                  >
                    No 🙈
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. NO ERROR STAGE */}
          {stage === 'no_error' && (
            <motion.div
              key="no_error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-50 z-20"
            >
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6 border-2 border-red-200">
                <div className="text-5xl">🚫</div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Option Unavailable!
                </h2>
                <p className="text-slate-600 text-sm">
                  "No" is strictly forbidden here! You must say YES to your surprise!
                </p>
                <button
                  onClick={handleNextStage}
                  className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-all"
                >
                  Go Back & Say YES ❤️
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. PARAGRAPH STAGE */}
          {stage === 'paragraph' && (
            <motion.div
              key="paragraph"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-pink-50"
            >
              <div className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl max-w-md w-full space-y-5">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800">A Message For You</h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                  "{customization.customParagraph || "Thank you for being the most amazing person in my life. Every laugh, every memory, every late night talk with you is a gift I cherish forever."}"
                </p>
                <button
                  onClick={handleNextStage}
                  className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-all"
                >
                  Continue To Poem ✨
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. POEM STAGE */}
          {stage === 'poem' && (
            <motion.div
              key="poem"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-rose-100"
            >
              <div className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-xl max-w-md w-full space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="flex justify-center"
                >
                  <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-800">A Poem Just For You</h3>
                <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-handwriting text-2xl">
                  {customization.customPoem || `Through sunny days and stormy weather,
We laugh and navigate together.
21 memories preserved in gold,
A story forever to be told.`}
                </div>
                <button
                  onClick={handleNextStage}
                  className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-all"
                >
                  Open The Gift Box 🎁
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. GIFT BOX STAGE */}
          {stage === 'gift_box' && (
            <motion.div
              key="gift_box"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-tr from-pink-200 via-rose-100 to-amber-100"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                onClick={() => {
                  triggerConfetti(true);
                  handleNextStage();
                }}
                className="cursor-pointer group"
              >
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-1 shadow-2xl group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-rose-500 rounded-[22px] flex flex-col items-center justify-center text-white p-4">
                    <Gift className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce" />
                    <span className="text-xs sm:text-sm font-black mt-2 tracking-wider uppercase">Tap To Open</span>
                  </div>
                </div>
              </motion.div>

              <p className="text-slate-700 font-bold text-lg mt-6">
                Tap the gift box to unleash 21 memories!
              </p>
            </motion.div>
          )}

          {/* 7. FLOATING PHOTOS (21 PHOTOS POPPING OUT OF BOX) STAGE */}
          {stage === 'floating_photos' && (
            <motion.div
              key="floating_photos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950 overflow-hidden flex flex-col items-center justify-center"
            >
              <div className="absolute top-6 z-20 text-center px-4">
                <h2 className="text-white text-xl sm:text-3xl font-extrabold tracking-tight">
                  {safeMemories.length} Unforgettable Memories ✨
                </h2>
                <p className="text-pink-300 text-xs sm:text-sm font-semibold">
                  Watch your photos pop out!
                </p>
              </div>

              {/* 21 Animated Floating Photo Cards */}
              <div className="relative w-full max-w-4xl h-[420px] flex items-center justify-center">
                {safeMemories.slice(0, 21).map((m, i) => {
                  const total = Math.max(safeMemories.slice(0, 21).length, 1);
                  const angle = (i / total) * 360;
                  const isMobile = windowWidth < 640;
                  const baseRadius = isMobile ? 65 : 120;
                  const stepRadius = isMobile ? 22 : 45;
                  const radius = baseRadius + (i % 3) * stepRadius;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <motion.div
                      key={m.id || i}
                      initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
                      animate={{
                        scale: 1,
                        x: x,
                        y: y,
                        rotate: (i % 2 === 0 ? 12 : -12),
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.12,
                        type: 'spring',
                        bounce: 0.35,
                      }}
                      className="absolute w-20 h-24 sm:w-28 sm:h-36 bg-white p-1.5 rounded-lg shadow-xl cursor-pointer hover:scale-125 hover:z-30 transition-transform"
                    >
                      <div className="w-full h-4/5 bg-slate-100 overflow-hidden rounded">
                        <SafeImage
                          src={m.imageUrl}
                          fallbackUrl={m.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300'}
                          alt={m.caption}
                          className="w-full h-full"
                          style={{
                            objectFit: m.objectFit || 'cover',
                            objectPosition: m.objectPosition || 'center',
                            filter: m.filter === 'vintage' ? 'sepia(0.5) hue-rotate(-30deg) contrast(1.2)' : m.filter === 'sepia' ? 'sepia(1)' : m.filter === 'grayscale' ? 'grayscale(1)' : m.filter === 'contrast' ? 'contrast(1.5)' : 'none'
                          }}
                        />
                      </div>
                      <p className="text-[9px] font-bold text-slate-800 text-center truncate mt-1">
                        #{i + 1}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="absolute bottom-6 z-20">
                <button
                  onClick={handleNextStage}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-xl transition-all flex items-center space-x-2 text-sm"
                >
                  <span>View Full Photo Collage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 8. 21 PHOTO COLLAGE GRID STAGE */}
          {stage === 'collage' && (
            <motion.div
              key="collage"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="absolute inset-0 bg-rose-100 overflow-y-auto p-4 sm:p-8 flex flex-col items-center"
            >
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                  21 Memories Collage
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Our Journey In Pictures
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl pb-20">
                {safeMemories.slice(0, 21).map((m, idx) => (
                  <div key={m.id || idx} className="bg-white p-2 rounded-xl shadow hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-1.5">
                      <SafeImage
                        src={m.imageUrl}
                        fallbackUrl={m.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'}
                        alt={m.caption}
                        className="w-full h-full"
                        style={{
                          objectFit: m.objectFit || 'cover',
                          objectPosition: m.objectPosition || 'center',
                          filter: m.filter === 'vintage' ? 'sepia(0.5) hue-rotate(-30deg) contrast(1.2)' : m.filter === 'sepia' ? 'sepia(1)' : m.filter === 'grayscale' ? 'grayscale(1)' : m.filter === 'contrast' ? 'contrast(1.5)' : 'none'
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 truncate">{m.caption}</p>
                    <p className="text-[10px] text-slate-400">{m.date}</p>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-6 z-30">
                <button
                  onClick={handleNextStage}
                  className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full shadow-2xl hover:bg-slate-800 transition-all flex items-center space-x-2 text-sm"
                >
                  <span>Open 3D Flipbook Scrapbook</span>
                  <ArrowRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </motion.div>
          )}

          
          
          {/* NEW STAGE: ANNIVERSARY COUNTER */}
          {stage === 'anniversary_counter' && (
            <motion.div
              key="anniversary_counter"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-950 via-rose-900 to-amber-950 z-20"
            >
              <div className="bg-white/10 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-[0_0_50px_rgba(225,29,72,0.3)] max-w-lg w-full relative border border-white/20 text-center">
                <Heart className="w-16 h-16 text-rose-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)] fill-rose-500 animate-pulse" />
                <h2 className="text-3xl font-serif text-white mb-2">{customization.counterTitle || "Every Second With You"}</h2>
                <p className="text-rose-200 mb-8 font-serif italic">Counting the beautiful moments...</p>
                
                {(() => {
                  const target = customization.targetDate ? new Date(customization.targetDate).getTime() : Date.now() - (365 * 24 * 60 * 60 * 1000);
                  const diffMs = Math.abs(Date.now() - target);
                  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const mins = Math.floor(diffMs / (1000 * 60));
                  const minsFormatted = mins >= 1000 ? `${Math.floor(mins / 1000)}k` : `${mins}`;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                      <div className="bg-black/20 rounded-xl p-4 border border-rose-500/30">
                        <div className="text-3xl font-bold text-white mb-1">{days}</div>
                        <div className="text-xs text-rose-300 uppercase tracking-widest">Days</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4 border border-rose-500/30">
                        <div className="text-3xl font-bold text-white mb-1">{hours.toLocaleString()}</div>
                        <div className="text-xs text-rose-300 uppercase tracking-widest">Hours</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4 border border-rose-500/30">
                        <div className="text-3xl font-bold text-white mb-1">{minsFormatted}</div>
                        <div className="text-xs text-rose-300 uppercase tracking-widest">Mins</div>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4 border border-rose-500/30">
                        <div className="text-3xl font-bold text-white mb-1">∞</div>
                        <div className="text-xs text-rose-300 uppercase tracking-widest">Love</div>
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handleNextStage}
                  className="px-8 py-4 bg-rose-500 text-white font-bold rounded-full shadow-lg hover:bg-rose-600 transition-all transform hover:scale-105"
                >
                  Continue to Letter ❤️
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: LOVE LETTER */}
          {stage === 'love_letter' && (
            <motion.div
              key="love_letter"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-950 to-rose-900 z-20"
            >
              <div className="bg-orange-50 p-8 md:p-12 rounded-lg shadow-2xl max-w-lg w-full relative border-8 border-orange-100/50">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
                <h2 className="text-3xl font-serif text-rose-900 mb-6 text-center italic">My Dearest {customization.recipientName},</h2>
                <p className="text-lg text-rose-800 font-serif leading-relaxed mb-8 whitespace-pre-wrap">
                  {customization.customParagraph || "You mean everything to me."}
                </p>
                <div className="text-right">
                  <p className="text-xl font-serif text-rose-900 italic">Forever Yours,</p>
                  <p className="text-2xl font-serif text-rose-700 font-bold mt-2">{customization.senderName}</p>
                </div>
                <button
                  onClick={handleNextStage}
                  className="mt-10 w-full px-6 py-4 bg-rose-800 text-rose-100 font-serif text-lg rounded shadow-md hover:bg-rose-900 transition-all"
                >
                  Open Our Memories
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: BIRTHDAY CAKE */}
          {stage === 'birthday_cake' && (
            <motion.div
              key="birthday_cake"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-400 to-indigo-600 z-20 text-center"
            >
              <motion.div 
                animate={{ y: [-10, 10, -10] }} 
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-9xl mb-8 drop-shadow-2xl"
              >
                🎂
              </motion.div>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Happy Birthday!</h2>
              <p className="text-xl text-sky-100 font-bold mb-10 max-w-md">{customization.customParagraph || "Wishing you the best day ever!"}</p>
              <button
                onClick={handleNextStage}
                className="px-8 py-4 bg-yellow-400 text-slate-900 font-black text-xl rounded-full shadow-xl hover:bg-yellow-300 transition-all transform hover:scale-110"
              >
                Blow the Candles! 🎈
              </button>
            </motion.div>
          )}

          
          {/* NEW STAGE: BIRTHDAY COUNTDOWN */}
          {stage === 'birthday_countdown' && (
            <motion.div
              key="birthday_countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 z-20 text-center"
            >
              <h2 className="text-3xl font-black text-indigo-300 mb-10 tracking-widest uppercase animate-pulse">Initializing Party Sequence...</h2>
                {(() => {
                  let days = 0, hours = 0, secs = 0;
                  if (customization.targetDate) {
                    const target = new Date(customization.targetDate).getTime();
                    const diffMs = target - Date.now();
                    if (diffMs > 0) {
                      days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      secs = Math.floor((diffMs % (1000 * 60)) / 1000);
                    }
                  }
                  return (
                    <div className="flex gap-4 md:gap-8 mb-12">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-indigo-500/30">
                          <span className="text-5xl md:text-7xl font-black text-white">{days}</span>
                        </div>
                        <span className="mt-2 text-indigo-400 font-bold uppercase tracking-widest text-sm">Days</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-indigo-500/30">
                          <span className="text-5xl md:text-7xl font-black text-white">{hours}</span>
                        </div>
                        <span className="mt-2 text-indigo-400 font-bold uppercase tracking-widest text-sm">Hours</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-indigo-500/30">
                          <span className="text-5xl md:text-7xl font-black text-white animate-bounce">{secs}</span>
                        </div>
                        <span className="mt-2 text-indigo-400 font-bold uppercase tracking-widest text-sm">Secs</span>
                      </div>
                    </div>
                  );
                })()}
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-8 drop-shadow-lg">
                IT'S TIME!
              </h1>
              <button
                onClick={handleNextStage}
                className="px-8 py-4 bg-indigo-500 text-white font-black text-xl rounded-xl shadow-[4px_4px_0px_#818cf8] hover:translate-y-1 hover:shadow-none transition-all uppercase"
              >
                Start the Party 🎉
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: INTERACTIVE CANDLES */}
          {stage === 'interactive_candles' && (
            <motion.div
              key="interactive_candles"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-sky-400 to-indigo-600 z-20 text-center"
            >
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Make a Wish!</h2>
              <p className="text-xl text-sky-100 font-bold mb-10 max-w-md">Tap the candles or use your mic to blow them out.</p>
              
              <div className="relative mb-12 flex justify-center items-end h-48 w-full max-w-md">
                {/* Cake Base */}
                <div className="absolute bottom-0 w-64 h-24 bg-pink-400 rounded-xl shadow-2xl border-4 border-pink-500 flex items-center justify-center">
                  <div className="w-full h-4 bg-pink-300 absolute top-4"></div>
                  <div className="w-full h-4 bg-pink-500 absolute bottom-4"></div>
                </div>
                
                {/* Candles */}
                <div className="flex gap-4 z-10 pb-20">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i} 
                      className="relative cursor-pointer group"
                      onClick={(e) => {
                        const target = e.currentTarget;
                        const flame = target.querySelector('.flame');
                        if (flame) flame.classList.add('hidden');
                        if (!target.parentElement?.querySelector('.flame:not(.hidden)')) {
                          setTimeout(handleNextStage, 1000);
                        }
                      }}
                    >
                      <div className="w-4 h-16 bg-white rounded-t-md shadow-inner border-2 border-slate-200">
                        <div className="w-full h-2 bg-red-400 mb-2"></div>
                        <div className="w-full h-2 bg-blue-400 mb-2"></div>
                        <div className="w-full h-2 bg-green-400"></div>
                      </div>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5] }} 
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="flame absolute -top-8 -left-1 w-6 h-8 bg-gradient-to-b from-yellow-300 to-orange-500 rounded-full blur-[2px]"
                      ></motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>

              
              <div className="mt-8 flex flex-col items-center gap-4">
                <button
                  onClick={startMic}
                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-indigo-50 transition-colors uppercase text-sm flex items-center gap-2"
                >
                  {micListening ? '🎤 Listening for blowing...' : '🎤 Enable Mic to Blow Out'}
                </button>
              </div>

              <button onClick={handleNextStage} className="mt-4 text-sky-200 underline text-sm">Skip ➡️</button>
            </motion.div>
          )}

          {/* NEW STAGE: CONFETTI BURST & GIFTS */}
          {stage === 'confetti_burst' && (
            <motion.div
              key="confetti_burst"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-yellow-400 z-20 text-center"
              onAnimationComplete={() => triggerConfetti(true)}
            >
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="text-8xl mb-8"
              >
                🎁
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase">Wishes Unlocked!</h2>
              <p className="text-xl text-yellow-900 font-bold mb-10 max-w-md">{customization.customParagraph || "We all came together to wish you the best!"}</p>
              
              <button
                onClick={() => {
                  triggerConfetti();
                  setTimeout(handleNextStage, 1000);
                }}
                className="px-8 py-4 bg-slate-900 text-yellow-400 font-black text-xl rounded-xl shadow-[4px_4px_0px_#fbbf24] hover:translate-y-1 hover:shadow-none border-2 border-slate-900 transition-all uppercase"
              >
                Read the Wishes 💌
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: GROUP WISHES WALL */}
          {stage === 'group_wishes_wall' && (
            <motion.div
              key="group_wishes_wall"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center p-6 bg-slate-100 z-20 overflow-y-auto"
            >
              <h2 className="text-3xl md:text-5xl font-black text-indigo-600 mb-8 mt-12 uppercase tracking-tight text-center">
                The Squad Says...
              </h2>
              
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-6xl w-full mb-12">
                {(customization.groupWishes && customization.groupWishes.length > 0 ? customization.groupWishes : [
                  { id: '1', name: customization.senderName, msg: customization.customParagraph || "Happy Birthday! You're the best!", color: "bg-pink-100 border-pink-300" },
                  { id: '2', name: "The Whole Crew", msg: "We wouldn't miss this for the world. Have an amazing year ahead!", color: "bg-blue-100 border-blue-300" },
                  { id: '3', name: "Secret Admirer", msg: "Keep shining bright! ✨", color: "bg-yellow-100 border-yellow-300" },
                  { id: '4', name: "Your Bestie", msg: "I brought the cake but I ate it. Sorry! Love you! 🎂", color: "bg-purple-100 border-purple-300" },
                  { id: '5', name: "Party Planner", msg: "Hope this virtual party makes your day!", color: "bg-emerald-100 border-emerald-300" }
                ]).map((wish, i) => (
                  <motion.div
                    key={wish.id || i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`break-inside-avoid mb-6 p-6 rounded-2xl border-2 ${wish.color || 'bg-indigo-50 border-indigo-200'} shadow-sm`}
                  >
                    <p className="text-slate-700 font-medium mb-4 text-lg leading-relaxed">"{wish.msg}"</p>
                    <p className="text-slate-900 font-black uppercase text-sm">- {wish.name}</p>
                  </motion.div>
                ))}
              </div>
              
              <button
                onClick={handleNextStage}
                className="px-8 py-4 bg-indigo-600 text-white font-black text-xl rounded-xl shadow-[4px_4px_0px_#c7d2fe] hover:translate-y-1 hover:shadow-none transition-all uppercase mb-12"
              >
                Open Photo Book 📸
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: POLAROID WALL */}
          {stage === 'polaroid_wall' && (
            <motion.div
              key="polaroid_wall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 z-20"
            >
              <h2 className="text-3xl font-bold text-fuchsia-400 mb-8 font-mono uppercase tracking-widest text-center">
                Bestie Wall of Fame
              </h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mb-10">
                {safeMemories.slice(0, 3).map((mem, i) => (
                  <motion.div 
                    key={i}
                    initial={{ rotate: Math.random() * 20 - 10, opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="bg-white p-3 pb-10 rounded shadow-xl w-40 h-48 md:w-56 md:h-64 transform rotate-3"
                  >
                    <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl} className="w-full h-full object-cover rounded-sm bg-slate-200" alt="polaroid" />
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleNextStage}
                className="px-8 py-4 bg-fuchsia-500 text-slate-900 font-black text-xl rounded-xl shadow-[4px_4px_0px_#fdf4ff] hover:translate-y-1 hover:shadow-none transition-all uppercase"
              >
                Enter The Scrapbook 📸
              </button>
            </motion.div>
          )}

          
          
          {/* NEW STAGE: INSIDE JOKES */}
          {stage === 'inside_jokes' && (
            <motion.div
              key="inside_jokes"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-purple-900 z-20"
            >
              <h2 className="text-3xl font-bold text-yellow-300 mb-8 font-mono uppercase text-center">
                Top Secret Insider Info 🤫
              </h2>
              <div className="bg-slate-900 p-6 rounded-2xl border-4 border-fuchsia-500 max-w-lg w-full text-center space-y-6">
                {(customization.insideJokes && customization.insideJokes.length > 0 ? customization.insideJokes : [
                  { id: '1', title: 'VOICE NOTE #1:', caption: safeMemories[0]?.caption || 'That one time... you know.' },
                  { id: '2', title: 'VOICE NOTE #2:', caption: safeMemories[1]?.caption || 'We do not speak of this.' }
                ]).map((joke, idx) => (
                  <div key={joke.id || idx} className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors cursor-pointer" onClick={() => { if(!audioMuted) { const a = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); a.play().catch(e=>console.log(e)); } }}>
                    <p className="text-fuchsia-300 font-mono mb-2">▶️ {joke.title || `VOICE NOTE #${idx+1}`}</p>
                    <p className="text-xl text-white font-bold italic">"{joke.caption}"</p>
                  </div>
                ))}
                
                <button
                  onClick={handleNextStage}
                  className="mt-4 px-8 py-4 bg-yellow-400 text-slate-900 font-black text-xl rounded-xl shadow-[4px_4px_0px_#fdf4ff] hover:translate-y-1 hover:shadow-none transition-all uppercase w-full"
                >
                  Take the Quiz 📝
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: FRIENDSHIP QUIZ */}
          {stage === 'friendship_quiz' && (
            <motion.div
              key="friendship_quiz"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-pink-500 z-20"
            >
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-8 border-yellow-300">
                <h2 className="text-2xl font-black text-pink-600 mb-2 uppercase">Bestie Vibe Check</h2>
                <p className="text-slate-500 mb-8 font-bold">{customization.quizQuestion || "Are we actually soulmates?"}</p>
                
                <div className="space-y-4 mb-8">
                  {(customization.quizOptions && customization.quizOptions.length > 0 ? customization.quizOptions : [
                    "A. We share the same brain cell",
                    "B. Unhinged voice notes at 3AM",
                    "C. \"Don't tell anyone, but...\""
                  ]).map((opt, optIdx) => (
                    <button key={optIdx} onClick={() => setQuizAnswered(true)} className="w-full p-4 bg-slate-100 rounded-xl hover:bg-pink-100 hover:text-pink-600 font-bold transition-colors border-2 border-transparent hover:border-pink-300 text-left">
                      {opt}
                    </button>
                  ))}
                </div>

                {quizAnswered && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-yellow-100 rounded-xl mb-8">
                    <p className="text-yellow-600 font-black">🏆 BADGE UNLOCKED:</p>
                    <p className="text-2xl font-black text-yellow-500 mt-2">{customization.quizBadgeText || "10/10 CHAOS DUO"}</p>
                  </motion.div>
                )}

                {quizAnswered && (
                  <button
                    onClick={handleNextStage}
                    className="w-full px-8 py-4 bg-pink-500 text-white font-black text-xl rounded-xl shadow-[4px_4px_0px_#fdf4ff] hover:translate-y-1 hover:shadow-none transition-all uppercase"
                  >
                    Claim Poster 🖼️
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: DOWNLOADABLE POSTER */}
          {stage === 'downloadable_poster' && (
            <motion.div
              key="downloadable_poster"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, rotate: 10 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 z-20"
            >
              <h2 className="text-2xl font-black text-cyan-400 mb-6 font-mono uppercase text-center">
                Your Digital Poster
              </h2>
              
              <div className="bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-2 rounded-2xl shadow-2xl mb-8 max-w-sm w-full transform rotate-1">
                <div className="bg-slate-900 p-6 rounded-xl text-center space-y-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white mb-4">
                    <SafeImage src={safeMemories[0]?.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae'} fallbackUrl="" className="w-full h-full object-cover" alt="Besties" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase">{customization.recipientName} & {customization.senderName}</h3>
                  <p className="text-cyan-300 font-mono">EST. 2024</p>
                  <p className="text-pink-300 italic text-sm">"Certified menaces to society."</p>
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={handleNextStage}
                  className="flex-1 px-4 py-4 bg-cyan-400 text-slate-900 font-black rounded-xl shadow-[4px_4px_0px_#fdf4ff] hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm flex items-center justify-center gap-2"
                >
                  ⬇️ Download
                </button>
                <button
                  onClick={handleNextStage}
                  className="flex-1 px-4 py-4 bg-purple-500 text-white font-black rounded-xl shadow-[4px_4px_0px_#fdf4ff] hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm"
                >
                  Continue ➡️
                </button>
              </div>
            </motion.div>
          )}

          
          {/* NEW STAGE: NOSTALGIC TIMELINE */}
          {stage === 'nostalgic_timeline' && (
            <motion.div
              key="nostalgic_timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute inset-0 flex flex-col items-center p-6 bg-amber-50 z-20 overflow-y-auto"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-amber-800 mb-10 text-center italic mt-12">
                Through the Years
              </h2>
              <div className="max-w-2xl w-full relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-200 transform -translate-x-1/2"></div>
                {(customization.timelineEvents && customization.timelineEvents.length > 0
                  ? customization.timelineEvents
                  : safeMemories.slice(0, 4).map((m, i) => ({
                      id: m.id || String(i),
                      year: `Year ${i+1}`,
                      title: m.caption || 'Special Memory',
                      description: m.caption || 'A moment we will treasure forever.',
                      imageUrl: m.imageUrl
                    }))
                ).map((evt, i) => (
                  <motion.div
                    key={evt.id || i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`flex items-center w-full mb-8 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`w-5/12 bg-white p-3 rounded-xl shadow-lg border border-amber-100 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      {evt.imageUrl && <SafeImage src={evt.imageUrl} fallbackUrl="" className="w-full h-32 object-cover rounded-lg mb-2" alt="Timeline" />}
                      <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded mb-1">{evt.year}</span>
                      <h4 className="font-bold text-slate-800 text-sm">{evt.title}</h4>
                      <p className="text-amber-800 font-medium text-xs mt-1">{evt.description}</p>
                    </div>
                    <div className="absolute left-1/2 w-6 h-6 bg-amber-400 rounded-full border-4 border-white shadow transform -translate-x-1/2"></div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleNextStage}
                className="mt-8 px-8 py-4 bg-amber-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-amber-600 transition-colors mb-12"
              >
                Open the Gratitude Cards 💌
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: GRATITUDE CARDS */}
          {stage === 'gratitude_cards' && (
            <motion.div
              key="gratitude_cards"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-orange-100 z-20"
            >
              <h2 className="text-2xl md:text-3xl font-serif text-orange-800 mb-8 text-center italic">
                Why I'm grateful for you
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                {(customization.gratitudeReasons && customization.gratitudeReasons.length > 0 ? customization.gratitudeReasons : [
                  "For always having my back, no matter what.",
                  "For the late night talks and endless laughter.",
                  "For understanding me without needing words.",
                  "For being my first and forever friend."
                ]).map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-orange-400 aspect-video flex items-center justify-center text-center cursor-pointer hover:-translate-y-2 transition-transform"
                  >
                    <p className="text-orange-900 font-medium font-serif text-lg">"{reason}"</p>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleNextStage}
                className="mt-10 px-8 py-4 bg-orange-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-orange-600 transition-colors"
              >
                Read our Oath 📜
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: SISTERHOOD OATH */}
          {stage === 'sisterhood_oath' && (
            <motion.div
              key="sisterhood_oath"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rose-50 z-20"
            >
              <div className="max-w-xl w-full bg-white p-8 md:p-12 rounded-lg shadow-2xl border border-rose-100 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 rounded-t-lg"></div>
                <h2 className="text-3xl font-serif text-rose-800 mb-6 text-center italic">The Sisterhood Oath</h2>
                <div className="space-y-4 text-rose-900/80 font-serif text-lg text-center mb-8 leading-relaxed">
                  {(customization.sisterhoodPromises && customization.sisterhoodPromises.length > 0 ? customization.sisterhoodPromises : [
                    "I promise to always be your safe space.",
                    "I promise to keep your secrets and share your joys.",
                    "I promise that no matter how much we grow,",
                    "or how far life takes us,",
                    "We will always be sisters first."
                  ]).map((promise, pIdx) => (
                    <p key={pIdx} className={pIdx === (customization.sisterhoodPromises?.length || 5) - 1 ? "font-bold text-rose-900 text-xl pt-2" : ""}>
                      {promise}
                    </p>
                  ))}
                </div>
                <div className="flex justify-center space-x-8 text-rose-800 font-serif italic border-t border-rose-100 pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-signature mb-1" style={{fontFamily: 'Caveat, cursive'}}>{customization.senderName}</p>
                    <p className="text-xs uppercase tracking-widest text-rose-400">Signed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-signature mb-1" style={{fontFamily: 'Caveat, cursive'}}>{customization.recipientName}</p>
                    <p className="text-xs uppercase tracking-widest text-rose-400">Signed</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleNextStage}
                className="mt-8 px-8 py-4 bg-rose-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-rose-600 transition-colors"
              >
                Claim Your Poster 🖼️
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: HIGH RES EXPORT */}
          {stage === 'high_res_export' && (
            <motion.div
              key="high_res_export"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 z-20"
            >
              <h2 className="text-2xl font-serif text-amber-100 mb-6 text-center">
                Your Memory Tree Poster
              </h2>
              
              <div className="bg-amber-50 p-4 rounded-xl shadow-2xl mb-8 max-w-sm w-full">
                <div className="border border-amber-200 p-6 text-center space-y-4 bg-white rounded-lg">
                  <h3 className="text-2xl font-serif text-amber-800 italic">Family & Sisterhood</h3>
                  <div className="flex justify-center -space-x-4 py-4">
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md z-10">
                      <SafeImage src={safeMemories[0]?.imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300'} fallbackUrl="" className="w-full h-full object-cover" alt="Pic1" />
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md z-20 transform scale-110">
                      <SafeImage src={safeMemories[1]?.imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300'} fallbackUrl="" className="w-full h-full object-cover" alt="Pic2" />
                    </div>
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md z-10">
                      <SafeImage src={safeMemories[2]?.imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300'} fallbackUrl="" className="w-full h-full object-cover" alt="Pic3" />
                    </div>
                  </div>
                  <p className="text-amber-900 font-serif text-sm">"Forever rooted in love, growing side by side."</p>
                  <p className="text-amber-400 text-xs tracking-widest uppercase mt-4">High Resolution Export</p>
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-sm">
                <button
                  onClick={handleNextStage}
                  className="flex-1 px-4 py-4 bg-amber-500 text-white font-bold rounded-xl shadow-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  ⬇️ HD Download
                </button>
                <button
                  onClick={handleNextStage}
                  className="flex-1 px-4 py-4 bg-white text-amber-900 font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-colors"
                >
                  Open Scrapbook ➡️
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: ARCADE SCREEN */}
          {stage === 'arcade_screen' && (
            <motion.div
              key="arcade_screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black z-20 border-8 border-slate-800"
            >
              <div className="w-full max-w-2xl border-4 border-emerald-500 p-8 text-center bg-emerald-950/20">
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-emerald-400 mb-8 font-mono uppercase animate-pulse break-words">
                  LEVEL 1: {customization.recipientName}
                </h2>
                <div className="space-y-4 mb-10 text-emerald-500 font-mono text-lg uppercase">
                  <p>PLAYER 1: {customization.recipientName}</p>
                  <p>PLAYER 2: {customization.senderName}</p>
                  <p>MISSION: {customization.occasion} SURPRISE</p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-8">
                  <button 
                    onClick={() => { if(!audioMuted){ new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3').play().catch(e=>e) } }}
                    className="p-3 bg-slate-900 border-2 border-emerald-500 text-emerald-400 font-mono text-sm hover:bg-emerald-500 hover:text-black transition-colors"
                  >
                    ▶ PLAY P1 SFX
                  </button>
                  <button 
                    onClick={() => { if(!audioMuted){ new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3').play().catch(e=>e) } }}
                    className="p-3 bg-slate-900 border-2 border-fuchsia-500 text-fuchsia-400 font-mono text-sm hover:bg-fuchsia-500 hover:text-black transition-colors"
                  >
                    ▶ PLAY P2 SFX
                  </button>
                </div>

                <button
                  onClick={handleNextStage}
                  className="px-8 py-4 bg-transparent border-4 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-black text-2xl font-mono transition-colors uppercase animate-bounce"
                >
                  PRESS START
                </button>
              </div>
            </motion.div>
          )}

          
          
          {/* NEW STAGE: ARCADE LEVEL QUEST */}
          {stage === 'arcade_level_quest' && (
            <motion.div
              key="arcade_level_quest"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black z-20 border-8 border-slate-800"
            >
              <h2 className="text-3xl font-black text-emerald-400 mb-8 font-mono uppercase text-center">
                QUEST LOG
              </h2>
              <div className="w-full max-w-2xl bg-slate-900 border-4 border-emerald-500 p-6 space-y-6">
                {[
                  { title: "First Encounter", status: "CLEARED" },
                  { title: "Late Night Calls", status: "CLEARED" },
                  { title: "Inside Jokes", status: "CLEARED" },
                  { title: "Current Mission", status: "IN PROGRESS" }
                ].map((q, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex justify-between items-center border-b-2 border-slate-800 pb-2"
                  >
                    <span className="text-emerald-500 font-mono text-lg uppercase">{q.title}</span>
                    <span className={`font-mono font-bold ${q.status === 'CLEARED' ? 'text-yellow-400' : 'text-fuchsia-500 animate-pulse'}`}>[{q.status}]</span>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={handleNextStage}
                className="mt-8 px-8 py-4 bg-emerald-500 text-black font-black text-xl font-mono hover:bg-emerald-400 transition-colors uppercase"
              >
                CONTINUE ▶
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: ARCADE PIXEL CARDS */}
          {stage === 'arcade_pixel_cards' && (
            <motion.div
              key="arcade_pixel_cards"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black z-20 border-8 border-slate-800"
            >
              <h2 className="text-3xl font-black text-fuchsia-500 mb-8 font-mono uppercase text-center">
                MEMORY INVENTORY
              </h2>
              <div className="flex flex-wrap justify-center gap-6 max-w-4xl mb-10">
                {safeMemories.slice(0, 3).map((mem, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-slate-900 border-4 border-fuchsia-500 p-2 w-40 h-40 md:w-56 md:h-56 relative group cursor-pointer hover:border-yellow-400 transition-colors"
                    onClick={() => {
                      if (!audioMuted) {
                        const a = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
                        a.play().catch(e=>console.log(e));
                      }
                    }}
                  >
                    <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl} className="w-full h-full object-cover filter contrast-125 saturate-150" alt="Pixel Memory" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-yellow-400 font-mono font-bold uppercase text-xs text-center px-2">{mem.caption || 'ITEM ACQUIRED'}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-slate-400 font-mono text-sm mb-6 uppercase">* TAP ITEMS TO PLAY SOUND *</p>
              <button
                onClick={handleNextStage}
                className="px-8 py-4 bg-fuchsia-500 text-black font-black text-xl font-mono hover:bg-fuchsia-400 transition-colors uppercase"
              >
                VIEW HIGH SCORE
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: ARCADE HIGH SCORE */}
          {stage === 'arcade_high_score' && (
            <motion.div
              key="arcade_high_score"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black z-20 border-8 border-slate-800"
            >
              <div className="w-full max-w-md bg-slate-900 border-4 border-yellow-400 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 opacity-50 animate-pulse"></div>
                <h2 className="text-3xl font-black text-yellow-400 mb-2 font-mono uppercase">
                  HIGH SCORE
                </h2>
                <p className="text-3xl sm:text-5xl font-black text-white font-mono mb-8 tracking-widest">
                  999,999
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-slate-300 font-mono text-lg uppercase">
                    <span>1ST</span>
                    <span className="text-emerald-400 font-bold">{customization.recipientName.substring(0, 3).toUpperCase() || 'YOU'}</span>
                    <span>999,999</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-mono text-lg uppercase">
                    <span>2ND</span>
                    <span>{customization.senderName.substring(0, 3).toUpperCase() || 'MEE'}</span>
                    <span>999,998</span>
                  </div>
                </div>
                <div className="bg-yellow-400 text-black p-2 font-mono font-bold uppercase animate-pulse mb-8">
                  NEW RECORD! FRIENDSHIP LEVEL MAX
                </div>
                <button
                  onClick={handleNextStage}
                  className="w-full px-8 py-4 bg-transparent border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-black text-xl font-mono transition-colors uppercase"
                >
                  SAVE & CONTINUE
                </button>
              </div>
            </motion.div>
          )}

          
          {/* NEW STAGE: STAR CONSTELLATIONS */}
          {stage === 'star_constellations' && (
            <motion.div
              key="star_constellations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-black z-20 overflow-hidden relative"
            >
              {/* Starry Background */}
              <div className="absolute inset-0 z-0">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: Math.random() * 3 + 1,
                      height: Math.random() * 3 + 1,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ repeat: Infinity, duration: Math.random() * 3 + 2 }}
                  />
                ))}
              </div>

              <h2 className="text-3xl md:text-5xl font-light text-indigo-200 mb-8 z-10 text-center uppercase tracking-widest drop-shadow-[0_0_10px_rgba(167,139,250,0.8)]">
                Our Constellations
              </h2>
              
              <div className="relative w-full max-w-3xl aspect-square md:aspect-video z-10">
                {/* SVG Lines Connecting Photos */}
                <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
                  <motion.line x1="20%" y1="30%" x2="50%" y2="20%" stroke="rgba(167, 139, 250, 0.5)" strokeWidth="2" strokeDasharray="5,5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
                  <motion.line x1="50%" y1="20%" x2="80%" y2="40%" stroke="rgba(167, 139, 250, 0.5)" strokeWidth="2" strokeDasharray="5,5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />
                  <motion.line x1="80%" y1="40%" x2="40%" y2="70%" stroke="rgba(167, 139, 250, 0.5)" strokeWidth="2" strokeDasharray="5,5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1.0 }} />
                </svg>

                {/* Nodes */}
                {[
                  { x: '20%', y: '30%', delay: 0 },
                  { x: '50%', y: '20%', delay: 0.5 },
                  { x: '80%', y: '40%', delay: 1.0 },
                  { x: '40%', y: '70%', delay: 1.5 }
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: pos.delay, type: 'spring' }}
                    className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-indigo-400 p-1 bg-black/50 backdrop-blur shadow-[0_0_15px_rgba(129,140,248,0.5)] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-110 transition-transform hover:z-20 hover:border-purple-300"
                    style={{ left: pos.x, top: pos.y }}
                  >
                     <SafeImage src={safeMemories[i]?.imageUrl || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86'} fallbackUrl="" className="w-full h-full object-cover rounded-full filter brightness-75 group-hover:brightness-110 transition-all" alt="Constellation Node" />
                     <div className="absolute inset-0 rounded-full bg-indigo-500/20 mix-blend-overlay"></div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleNextStage}
                className="mt-12 px-8 py-3 bg-transparent border border-indigo-500 text-indigo-300 rounded-full hover:bg-indigo-900/50 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all uppercase tracking-widest z-10 text-sm"
              >
                Make a Wish 🌠
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: SHOOTING STAR WISH */}
          {stage === 'shooting_star_wish' && (
            <motion.div
              key="shooting_star_wish"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-black z-20 overflow-hidden relative"
            >
              <div className="absolute inset-0 z-0">
                {[...Array(100)].map((_, i) => (
                  <motion.div
                    key={`bgstar-${i}`}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: Math.random() * 2 + 1,
                      height: Math.random() * 2 + 1,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.1
                    }}
                  />
                ))}
              </div>

              {/* Shooting star animation */}
              <motion.div
                className="absolute top-1/4 left-0 w-32 h-1 bg-gradient-to-r from-transparent via-white to-purple-300 rounded-full z-0 drop-shadow-[0_0_10px_white]"
                initial={{ x: '-100%', y: '-100%', opacity: 1 }}
                animate={{ x: '100vw', y: '100vh', opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
              />

              <div className="z-10 text-center max-w-xl bg-black/40 p-8 md:p-12 rounded-3xl border border-indigo-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-6xl mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                >
                  🌠
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-light text-white mb-6 uppercase tracking-widest font-serif drop-shadow-[0_0_5px_rgba(167,139,250,0.8)]">
                  My Wish For You
                </h2>
                <p className="text-xl text-indigo-200 leading-relaxed font-light italic mb-8">
                  "{customization.customParagraph || "May you always find your guiding star in the darkest nights, and may your brightest dreams come true."}"
                </p>
                
                <p className="text-indigo-400 text-sm tracking-widest uppercase mb-8">
                  - {customization.senderName} -
                </p>

                <button
                  onClick={handleNextStage}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all uppercase tracking-widest text-sm font-semibold"
                >
                  Explore the Universe 🚀
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: GRATITUDE TREE */}
          {stage === 'gratitude_tree' && (
            <motion.div
              key="gratitude_tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-950 to-orange-950 z-20 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
              <motion.div 
                animate={{ y: [-5, 5, -5] }} 
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="text-8xl md:text-9xl mb-8 drop-shadow-2xl"
              >
                🌳
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-amber-200 mb-6 drop-shadow-md text-center">
                Our Roots Run Deep
              </h2>
              <div className="bg-amber-900/40 backdrop-blur-sm p-6 rounded-2xl border border-amber-700 max-w-lg mb-8">
                <p className="text-lg text-amber-100 font-serif leading-relaxed text-center italic">
                  "{customization.customParagraph || "Thank you for being the most amazing sister. We grew up from the same roots, and no matter which branches we grow on, we will always be connected."}"
                </p>
              </div>
              <button
                onClick={handleNextStage}
                className="px-8 py-4 bg-amber-600 text-amber-50 font-bold text-lg rounded-full shadow-lg hover:bg-amber-500 transition-all border border-amber-500/50"
              >
                Explore Memories 🌿
              </button>
            </motion.div>
          )}

          {/* NEW STAGE: CELESTIAL WISHES */}
          {stage === 'celestial_wishes' && (
            <motion.div
              key="celestial_wishes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 z-20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
                className="w-[200vw] h-[200vw] absolute rounded-full border border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.2)] pointer-events-none"
              ></motion.div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="relative z-10 text-center"
              >
                <div className="text-7xl mb-6">🌌</div>
                <h2 className="text-4xl md:text-5xl font-sans tracking-widest text-indigo-100 mb-6 font-light uppercase">
                  Written in the Stars
                </h2>
                <div className="max-w-md mx-auto mb-10">
                  <p className="text-lg text-indigo-200 leading-relaxed font-light">
                    {customization.customParagraph || "You are the brightest star in my universe."}
                  </p>
                </div>
                <button
                  onClick={handleNextStage}
                  className="px-10 py-4 bg-indigo-600/20 backdrop-blur-md text-indigo-100 font-bold tracking-widest uppercase text-sm rounded-full border border-indigo-400 hover:bg-indigo-600/40 hover:scale-105 transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                >
                  Enter Constellation ✨
                </button>
              </motion.div>
            </motion.div>
          )}

          
          {/* NEW STAGE: EDITORIAL COVER */}
          {stage === 'editorial_cover' && (
            <motion.div
              key="editorial_cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-stone-100 z-20"
            >
              <div className="w-full max-w-4xl h-[80vh] border-[1px] border-stone-300 bg-white relative flex flex-col p-8 md:p-12 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                
                <div className="flex justify-between items-center w-full mb-12 relative z-10 border-b pb-4 border-stone-300">
                  <span className="text-stone-500 font-sans text-xs tracking-widest uppercase">Vol. I</span>
                  <span className="text-stone-500 font-sans text-xs tracking-widest uppercase">{new Date().getFullYear()}</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-6xl md:text-8xl lg:text-9xl font-serif text-stone-900 tracking-tighter mb-6 leading-none"
                    style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
                  >
                    VOGUE<span className="text-2xl md:text-4xl absolute -top-4 -right-4 italic text-stone-400">ish</span>
                  </motion.h1>
                  
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="w-32 h-px bg-stone-900 mb-8 origin-center"
                  />

                  <motion.h2 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="text-2xl md:text-4xl font-light text-stone-800 font-serif italic mb-4"
                  >
                    Featuring {customization.recipientName}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="text-stone-500 font-sans text-sm tracking-[0.2em] uppercase max-w-md mt-12"
                  >
                    A minimalist retrospective of our finest moments.
                  </motion.p>
                </div>

                <div className="w-full flex justify-center mt-auto relative z-10 pt-8">
                  <button
                    onClick={handleNextStage}
                    className="px-8 py-3 bg-stone-900 text-stone-100 font-sans text-xs tracking-[0.3em] uppercase hover:bg-stone-800 transition-colors group flex items-center gap-4"
                  >
                    Open Issue <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: EDITORIAL STORY */}
          {stage === 'editorial_story' && (
            <motion.div
              key="editorial_story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center overflow-y-auto overflow-x-hidden p-6 md:p-12 bg-[#F9F9F9] z-20"
            >
              <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-12 mt-12 md:mt-24 mb-32">
                <div className="lg:w-1/2 flex flex-col justify-center order-2 lg:order-1">
                  <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-4xl md:text-6xl font-serif text-stone-900 mb-8 leading-tight tracking-tight"
                  >
                    The Art of <br/><span className="italic text-stone-500">Connection</span>.
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-lg text-stone-600 font-serif leading-relaxed space-y-6 columns-1 md:columns-2 gap-8 text-justify"
                  >
                    <p className="first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-stone-900">
                      {customization.customParagraph || "Every photograph tells a story, and ours is written in the subtle glances, the shared laughter, and the quiet moments between the chaos of life. This collection is a testament to those memories, curated with the utmost care."}
                    </p>
                    <p>
                      In a world constantly rushing forward, it is a rare privilege to pause and reflect on the beauty we have created together. The aesthetic is minimal, but the emotions are profound.
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                    onClick={handleNextStage}
                    className="mt-16 self-start px-8 py-3 border border-stone-900 text-stone-900 font-sans text-xs tracking-[0.2em] uppercase hover:bg-stone-900 hover:text-white transition-colors"
                  >
                    Continue to Archive
                  </motion.button>
                </div>
                
                <div className="lg:w-1/2 flex justify-center order-1 lg:order-2">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                    className="w-full aspect-[3/4] bg-stone-200 relative overflow-hidden"
                  >
                    <SafeImage src={safeMemories[1]?.imageUrl || safeMemories[0]?.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d'} fallbackUrl="" className="w-full h-full object-cover filter contrast-125 saturate-50" alt="editorial portrait" />
                    <div className="absolute bottom-4 right-4 text-white text-xs font-sans tracking-widest mix-blend-difference">FIG. 01</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: EDITORIAL GALLERY */}
          {stage === 'editorial_gallery' && (
            <motion.div
              key="editorial_gallery"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-stone-100 z-20"
            >
              <div className="w-full max-w-3xl flex flex-col items-center">
                <h2 className="text-5xl md:text-7xl font-serif text-stone-900 mb-4 tracking-tighter lowercase text-center">
                  The Collection
                </h2>
                <div className="w-16 h-px bg-stone-400 mb-8"></div>
                <div className="flex gap-4 mb-12 h-64 md:h-80 w-full overflow-hidden">
                  {safeMemories.slice(0, 3).map((mem, i) => (
                    <motion.div 
                      key={i}
                      initial={{ filter: 'grayscale(100%)' }}
                      whileHover={{ filter: 'grayscale(0%)', width: '60%' }}
                      className="flex-1 transition-all duration-500 overflow-hidden bg-stone-300 relative"
                    >
                      <SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl} className="w-full h-full object-cover" alt="editorial" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-stone-600 font-serif italic mb-10 text-center max-w-md">
                  {customization.customParagraph || "A curated exhibition of our most cherished moments."}
                </p>
                <button
                  onClick={handleNextStage}
                  className="px-10 py-4 bg-stone-900 text-stone-100 font-sans text-xs tracking-[0.3em] uppercase hover:bg-stone-800 transition-colors"
                >
                  View Exhibition
                </button>
              </div>
            </motion.div>
          )}

          {/* NEW STAGE: VINTAGE LETTER */}
          {stage === 'vintage_letter' && (
            <motion.div
              key="vintage_letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-stone-900 z-20 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')] mix-blend-overlay"></div>
              
              <motion.div 
                initial={{ y: 50, rotate: 2 }}
                animate={{ y: 0, rotate: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-[#f4ebd8] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-xl w-full relative border border-[#e6d5b8] transform rotate-1"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
              >
                {/* Antique Wax Seal */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#8B0000] rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(139,0,0,0.5)] rotate-12 border-2 border-[#5c0000] z-10" style={{ backgroundImage: 'radial-gradient(circle, #a11, #8B0000)' }}>
                  <div className="w-12 h-12 rounded-full border border-[#5c0000] flex items-center justify-center opacity-80">
                    <span className="text-[#ffcccc] text-2xl font-serif italic drop-shadow-md" style={{ fontFamily: '"Great Vibes", cursive' }}>S</span>
                  </div>
                </div>

                {/* Pressed botanical graphic top left */}
                <div className="absolute -top-8 -left-8 w-32 h-32 opacity-80 -rotate-12 pointer-events-none mix-blend-multiply">
                  <img src="https://images.unsplash.com/photo-1603484466540-84382cc1b9da?auto=format&fit=crop&q=80&w=200&h=200" className="object-cover rounded-full filter sepia contrast-150 saturate-50" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} alt="pressed leaf" />
                </div>

                <h2 className="text-4xl text-[#5c4033] mb-8" style={{ fontFamily: '"Homemade Apple", cursive' }}>Dearest {customization.recipientName},</h2>
                
                <p className="text-xl text-[#4a3b32] leading-relaxed mb-10 text-justify" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.6rem' }}>
                  {customization.customParagraph || "Through the sands of time, our memories remain as beautiful as the day they were made. Like pressed flowers in an old book, I've gathered our most cherished moments here, preserved forever."}
                </p>
                
                <div className="text-right">
                  <p className="text-3xl text-[#5c4033] font-bold signature-font" style={{ fontFamily: '"Homemade Apple", cursive' }}>{customization.senderName}</p>
                </div>
                
                <div className="mt-16 flex justify-center relative z-10">
                  <button
                    onClick={handleNextStage}
                    className="px-10 py-3 bg-transparent text-[#5c4033] border border-[#5c4033] font-serif italic text-lg hover:bg-[#5c4033] hover:text-[#f4ebd8] transition-all"
                  >
                    Unfold Memories
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* NEW STAGE: VINTAGE BOTANICAL GALLERY */}
          {stage === 'vintage_botanical_gallery' && (
            <motion.div
              key="vintage_botanical_gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col p-6 md:p-12 bg-[#e8e0cc] z-20 overflow-y-auto"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
            >
              <div className="w-full max-w-5xl mx-auto pt-8 pb-24">
                <div className="text-center mb-16">
                  <h2 className="text-5xl md:text-6xl text-[#5c4033] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                    The Archive
                  </h2>
                  <div className="w-24 h-[1px] bg-[#8c7b6d] mx-auto my-6"></div>
                  <p className="text-[#8c7b6d] font-serif italic text-xl">Botanical specimens & captured light.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                  {safeMemories.slice(0, 4).map((mem, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, rotate: (i % 2 === 0 ? -2 : 3) }}
                      whileInView={{ opacity: 1, rotate: (i % 2 === 0 ? -1 : 1) }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                      className="bg-[#f4ebd8] p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative border border-[#d6c5a8]"
                    >
                      {/* Tape corners */}
                      <div className="absolute -top-3 -left-3 w-12 h-6 bg-amber-900/20 rotate-[-45deg] shadow-sm backdrop-blur-[1px]"></div>
                      <div className="absolute -bottom-3 -right-3 w-12 h-6 bg-amber-900/20 rotate-[-45deg] shadow-sm backdrop-blur-[1px]"></div>

                      <div className="relative overflow-hidden group aspect-[4/3] border border-[#d6c5a8] p-1 bg-[#fffdf9]">
                        <SafeImage 
                          src={mem.imageUrl} 
                          fallbackUrl={mem.fallbackUrl} 
                          className="w-full h-full object-cover filter sepia-[0.3] contrast-[1.1] brightness-[0.95] group-hover:sepia-0 transition-all duration-700" 
                          alt="vintage memory" 
                        />
                        {/* Overlay texture on image */}
                        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")' }}></div>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <p className="text-[#5c4033] text-xl" style={{ fontFamily: '"Caveat", cursive' }}>
                          {mem.caption || `Exhibit No. ${i+1}`}
                        </p>
                      </div>

                      {/* Pressed flower graphic (alternating) */}
                      {i % 2 === 1 && (
                        <div className="absolute -bottom-10 -left-6 w-24 h-24 opacity-60 pointer-events-none mix-blend-multiply rotate-45">
                          <img src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=200&h=200" className="object-cover rounded-full filter sepia contrast-150 saturate-50" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} alt="pressed flower" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-24 flex justify-center">
                  <button
                    onClick={handleNextStage}
                    className="px-10 py-3 bg-[#5c4033] text-[#f4ebd8] font-serif italic text-xl shadow-[0_5px_15px_rgba(92,64,51,0.4)] hover:bg-[#4a332a] transition-colors border border-[#3d2a23]"
                  >
                    Open the Scrapbook
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 9. 3D FLIPBOOK SCRAPBOOK STAGE */}
          {stage === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-2 sm:p-6"
            >
              <div className="w-full max-w-3xl h-[480px] sm:h-[540px]">
                <Book 
                  memories={safeMemories} 
                  stickers={customization.placedStickers} 
                  signatureUrl={customization.signatureUrl}
                  senderName={customization.senderName}
                />
              </div>

              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 bg-rose-500 text-white font-bold rounded-full text-xs sm:text-sm hover:bg-rose-600 transition-colors shadow-lg"
                >
                  Finish Surprise ❤️
                </button>
              </div>
            </motion.div>
          )}

          {/* 10. FINAL STAGE */}
          {stage === 'final' && (() => {
            const finalBgClass = customization.finalBgGradient === 'midnight'
              ? 'bg-gradient-to-tr from-slate-950 via-purple-950 to-indigo-900 text-white'
              : customization.finalBgGradient === 'emerald'
              ? 'bg-gradient-to-tr from-emerald-700 via-teal-700 to-cyan-600 text-white'
              : customization.finalBgGradient === 'gold'
              ? 'bg-gradient-to-tr from-amber-600 via-yellow-600 to-orange-500 text-white'
              : customization.finalBgGradient === 'cosmic'
              ? 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-pink-600 text-white'
              : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white';

            return (
              <motion.div
                key="final"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center overflow-y-auto ${finalBgClass}`}
              >
                {customization.finalImageUrl ? (
                  <div className="mb-4 relative group max-w-xs">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-white/80 shadow-2xl mx-auto rotate-1 hover:rotate-0 transition-transform">
                      <img
                        src={customization.finalImageUrl}
                        alt="Final Souvenir"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-300 text-slate-900 p-1.5 rounded-full shadow-lg">
                      <PartyPopper className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <PartyPopper className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-300 animate-bounce mb-3" />
                )}

                <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 text-white drop-shadow-sm">
                  {customization.finalHeading || `I Love You, ${customization.recipientName || 'Bestie'}!`}
                </h2>

                <p className="text-white/90 max-w-md text-xs sm:text-sm mb-6 leading-relaxed">
                  {customization.finalMessage || `Hope this ${safeMemories.length > 0 ? `${safeMemories.length}-memory ` : ''}surprise brought a huge smile to your face!`}
                </p>

                {(customization.signatureUrl || customization.senderName || customization.finalClosingNote) && (
                  <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-xs mx-auto text-center">
                    <p className="text-white/90 text-xs font-serif italic mb-2">
                      {customization.finalClosingNote || 'With all my love,'}
                    </p>
                    {customization.signatureUrl && (
                      <div className="my-2 p-2.5 bg-white/95 rounded-xl shadow-inner inline-block mx-auto border border-white/60">
                        <img 
                          src={customization.signatureUrl} 
                          alt="Handwritten Signature" 
                          className="h-16 w-auto mx-auto object-contain max-w-[200px]" 
                        />
                      </div>
                    )}
                    {customization.senderName && (
                      <p className="text-white text-xs sm:text-sm font-extrabold tracking-wide mt-1">
                        — {customization.senderName}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStage('greeting')}
                  className="px-6 py-2.5 bg-white text-rose-600 font-bold rounded-full shadow-xl hover:bg-rose-50 transition-all flex items-center space-x-2 text-xs sm:text-sm active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{customization.finalButtonText || 'Replay Surprise'}</span>
                </button>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Floating Spotify Audio Bar (If Spotify Track Selected) */}
      {(spotifyEmbedUrl || customization.spotifyPreviewUrl) && showSpotifyPlayer && stage !== 'greeting' && (
        <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 pointer-events-auto bg-slate-950/90 border border-emerald-500/50 backdrop-blur-xl rounded-2xl p-2.5 shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Soundtrack
              </span>
            </div>
            <button
              onClick={() => setShowSpotifyPlayer(false)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
          {customization.spotifyPreviewUrl ? (
            <div className="flex items-center space-x-3 p-2 bg-slate-900 rounded-xl">
               <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                 <Music className="w-5 h-5 text-emerald-500" />
               </div>
               <div className="flex-1 overflow-hidden">
                 <p className="text-xs font-bold text-white truncate">{customization.spotifyTrackName || 'Custom Song'}</p>
                 <p className="text-[10px] text-slate-400 truncate">{customization.spotifyArtistName || 'Artist'}</p>
               </div>
               <div className="px-2 text-emerald-400">
                 {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
               </div>
            </div>
          ) : spotifyEmbedUrl ? (
            <iframe
              src={spotifyEmbedUrl}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
              title="Spotify Audio Player"
            />
          ) : null}
        </div>
      )}

    </div>
  );
}
