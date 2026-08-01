import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, VolumeX, Play, Pause, Heart, Sparkles, Music, Check, RefreshCw, 
  Camera, Smile, Image as ImageIcon, ChevronRight, ChevronLeft, Plus, X, Upload 
} from 'lucide-react';
import { UserCustomization } from '../types';
import { SafeImage } from './SafeImage';
import confetti from 'canvas-confetti';
import { soundscapeEngine } from '../utils/soundscapes';

interface FriendshipDayGreetViewProps {
  customization: UserCustomization;
  onClose?: () => void;
  isStandaloneView?: boolean;
  isPreviewMode?: boolean;
}

const STICKER_PALETTE = ['🌸', '💖', '⭐', '📸', '🍦', '🎀', '🎈', '🍩', '🎁', '🐶', '🍕', '🌟', '☕', '🦄', '💌', '🎉'];

// Custom Scratch Card Component with HTML5 Canvas + Attached Photo / Sticker
const ScratchCard = ({
  index,
  truthNumber,
  truthText,
  photoUrl,
  sticker,
  isRevealed,
  onReveal,
  onOpenAttachmentModal,
}: {
  index: number;
  truthNumber: string;
  truthText: string;
  photoUrl?: string;
  sticker?: string;
  isRevealed: boolean;
  onReveal: () => void;
  onOpenAttachmentModal: (index: number) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const scratchedAmountRef = useRef(0);

  useEffect(() => {
    scratchedAmountRef.current = isRevealed ? 100 : 0;
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.offsetWidth || 280);
    const height = (canvas.height = canvas.parentElement?.offsetHeight || 220);

    const drawScratchSurface = (img?: HTMLImageElement) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, width, height);

      if (img && img.complete && img.naturalWidth > 0) {
        // Draw photo as cover on top scratch surface
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const x = (width - img.naturalWidth * scale) / 2;
        const y = (height - img.naturalHeight * scale) / 2;
        ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);

        // Soft semi-transparent tint overlay for scratch texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, 0, width, height);

        // Golden Foil Border
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        // Sticker badge in top corner if provided
        if (sticker) {
          ctx.font = '28px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(sticker, width - 12, 12);
        }

        // Clean cover photo - no text overlay written over photo as requested
      } else {
        // Draw Pastel Foil with Sticker surface
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#a7f3d0'); // mint
        grad.addColorStop(0.5, '#fde68a'); // amber
        grad.addColorStop(1, '#fbcfe8'); // pink
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Decorative diagonal pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        for (let i = -width; i < width + height; i += 18) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + height, height);
          ctx.stroke();
        }

        // Emerald border frame
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 5;
        ctx.strokeRect(3, 3, width - 6, height - 6);

        // Sticker Emoji if provided
        if (sticker) {
          ctx.font = '56px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sticker, width / 2, height / 2);
          // Clean sticker emoji - NO text overlay written over sticker as requested
        } else {
          // Minimal decorative center highlight when neither photo nor sticker
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, 24, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    if (photoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = photoUrl;
      img.onload = () => drawScratchSurface(img);
      img.onerror = () => drawScratchSurface();
      drawScratchSurface();
    } else {
      drawScratchSurface();
    }
  }, [isRevealed, photoUrl, sticker]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    scratchedAmountRef.current += 5;
    if (scratchedAmountRef.current >= 35 && !isRevealed) {
      onReveal();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsScratching(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border-2 border-emerald-200 bg-white shadow-[4px_4px_0px_0px_rgba(167,243,208,0.8)] flex flex-col items-center justify-between p-3 text-center select-none group"
    >
      {/* Revealed Content underneath (Text Only) */}
      <div className="w-full h-full flex flex-col items-center justify-between z-0 p-2 bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/90 rounded-xl border border-emerald-100/80 shadow-xs">
        {/* Top bar: Truth badge */}
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Truth {truthNumber}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600 italic">
            ✿ truth unlocked ✿
          </span>
        </div>

        {/* Truth statement text ONLY - clean & elegant */}
        <div className="my-auto py-2 px-1 text-center flex items-center justify-center">
          <p className="font-serif italic text-sm sm:text-base text-slate-900 font-bold leading-relaxed">
            "{truthText}"
          </p>
        </div>

        {/* Footer: Edit Cover Photo/Sticker button */}
        <div className="w-full flex items-center justify-between pt-1 border-t border-emerald-100 mt-1">
          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <span>✨</span> secret note
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAttachmentModal(index);
            }}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Camera className="w-3 h-3" />
            <span>{photoUrl || sticker ? 'Edit Cover' : '+ Cover Photo'}</span>
          </button>
        </div>
      </div>

      {/* Canvas Scratch Overlay */}
      {!isRevealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 w-full h-full z-10 cursor-pointer touch-none"
        />
      )}
    </div>
  );
};

export function FriendshipDayGreetView({ customization, onClose, isStandaloneView, isPreviewMode = false }: FriendshipDayGreetViewProps) {
  const recipientName = customization.recipientName || 'Bestie';
  const senderName = customization.senderName || 'Your Friend';

  // State
  const [showIntro, setShowIntro] = useState(!isPreviewMode);
  const [showPopUpNote, setShowPopUpNote] = useState(false);
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  const [isWaxSealCracking, setIsWaxSealCracking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playCrackSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = audioCtx.sampleRate * 0.08;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1200;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch {
      // Ignore audio error if browser blocks auto audio
    }
  };
  const [audioProgress, setAudioProgress] = useState(25);
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});
  const [revealedTruths, setRevealedTruths] = useState<{ [key: number]: boolean }>({});

  // Page Step State: 1 = Greeting & Song, 2 = Memory Wall, 3 = Scratch Cards, 4 = Final Letter
  const [currentPage, setCurrentPage] = useState<number>(1);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Scratch card attachments (photo + sticker per card index)
  const [scratchCardAttachments, setScratchCardAttachments] = useState<{
    [index: number]: { photoUrl?: string; sticker?: string };
  }>({});
  const [attachmentModalIndex, setAttachmentModalIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const customAudioUrl = customization.spotifyPreviewUrl || customization.spotifyTrackUrl;

  useEffect(() => {
    if (isPlayingAudio) {
      if (customAudioUrl) {
        soundscapeEngine.stop();
        if (audioRef.current) {
          audioRef.current.play().catch((e) => console.log('Audio autoplay prevented:', e));
        }
      } else if (customization.ambientSoundscape && customization.ambientSoundscape !== 'none') {
        soundscapeEngine.play(customization.ambientSoundscape);
      } else {
        soundscapeEngine.play('rainy_cafe');
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      soundscapeEngine.stop();
    }
    return () => {
      soundscapeEngine.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isPlayingAudio, customAudioUrl, customization.ambientSoundscape]);

  const toggleFlipCard = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleRevealTruth = (index: number) => {
    if (!revealedTruths[index]) {
      setRevealedTruths((prev) => ({ ...prev, [index]: true }));
      confetti({
        particleCount: 20,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#a7f3d0', '#fbcfe8', '#fef08a'],
      });
    }
  };

  const revealAllTruths = () => {
    const allRevealed = { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true };
    setRevealedTruths(allRevealed);
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#34d399', '#f472b6', '#fbbf24'],
    });
  };

  // Mock audio progress loop
  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Fallback memories or customized memories
  const memoriesList = customization.memories && customization.memories.length > 0
    ? customization.memories
    : [
        { id: '1', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=800&q=80', caption: 'Day one energy — best friends forever! 💖' },
        { id: '2', imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80', caption: 'Still one of the funniest days of our lives 📸' },
        { id: '3', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80', caption: 'Unhinged 3 AM voice notes twin forever 🔊' },
        { id: '4', imageUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&q=80', caption: 'Spontaneous trips, lost maps & endless laughter 🚗' },
        { id: '5', imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80', caption: 'Coffee dates that turned into 5-hour heart to hearts ☕' },
        { id: '6', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', caption: 'Laughing until our stomachs literally hurt 🌸' },
      ];

  // Initialize scratch card attachments
  useEffect(() => {
    const initial: { [index: number]: { photoUrl?: string; sticker?: string } } = {};
    const defaultStickers = ['🌸', '💖', '⭐', '📸', '🍦', '🎀'];
    for (let i = 0; i < 6; i++) {
      initial[i] = {
        sticker: defaultStickers[i % defaultStickers.length],
        photoUrl: memoriesList[i % memoriesList.length]?.imageUrl || '',
      };
    }
    setScratchCardAttachments(initial);
  }, [customization.memories]);

  const defaultTruths = [
    'you always show up no matter what',
    "you're genuinely the funniest person I know",
    'you keep every secret safe with your life',
    'best late-night unhinged advisor',
    'you make everyday chaos feel like an adventure',
    'a rare, beautiful & genuine soul forever',
  ];

  const customTruths = customization.gratitudeReasons && customization.gratitudeReasons.length > 0
    ? customization.gratitudeReasons
    : defaultTruths;

  const truthsList = Array.from({ length: 6 }).map((_, idx) => ({
    num: `0${idx + 1}`,
    text: customTruths[idx] || defaultTruths[idx] || 'you are amazing',
  }));

  return (
    <div
      ref={mainContainerRef}
      className="h-full w-full relative overflow-y-auto overflow-x-hidden font-sans text-slate-800 bg-[#f0fdf4] bg-[linear-gradient(to_right,#bbf7d0_1px,transparent_1px),linear-gradient(to_bottom,#bbf7d0_1px,transparent_1px)] bg-[size:24px_24px] pb-24"
    >
      
      {/* 1. INTRO DELIVERY SCREEN */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#f0fdf4] bg-[linear-gradient(to_right,#a7f3d0_1px,transparent_1px),linear-gradient(to_bottom,#a7f3d0_1px,transparent_1px)] bg-[size:24px_24px]"
          >
            {/* Hot Air Balloon Graphic */}
            <motion.div
              animate={{
                y: [-15, 15, -15],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative flex flex-col items-center mb-8 cursor-pointer"
              onClick={() => setShowPopUpNote(true)}
            >
              {/* Kawaii Hot Air Balloon SVG */}
              <div className="relative w-48 h-56 flex flex-col items-center drop-shadow-[0_10px_15px_rgba(5,150,105,0.2)]">
                {/* Balloon Top */}
                <svg viewBox="0 0 200 220" className="w-full h-full">
                  <defs>
                    <linearGradient id="balloonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a7f3d0" />
                      <stop offset="50%" stopColor="#fed7aa" />
                      <stop offset="100%" stopColor="#fbcfe8" />
                    </linearGradient>
                  </defs>

                  {/* Outer Balloon Shape */}
                  <path
                    d="M 100,10 C 155,10 185,50 170,110 C 158,150 120,170 110,175 L 90,175 C 80,170 42,150 30,110 C 15,50 45,10 100,10 Z"
                    fill="url(#balloonGrad)"
                    stroke="#059669"
                    strokeWidth="4"
                  />

                  {/* Decorative Pastel Stripes */}
                  <path d="M 100,10 C 120,40 120,140 100,175" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
                  <path d="M 100,10 C 80,40 80,140 100,175" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8" />

                  {/* Cute Cloud Embellishments */}
                  <circle cx="60" cy="80" r="12" fill="#ffffff" opacity="0.9" />
                  <circle cx="72" cy="76" r="16" fill="#ffffff" opacity="0.9" />
                  <circle cx="84" cy="82" r="10" fill="#ffffff" opacity="0.9" />

                  {/* Kawaii Face on Balloon */}
                  <circle cx="85" cy="110" r="3" fill="#065f46" />
                  <circle cx="115" cy="110" r="3" fill="#065f46" />
                  <path d="M 96,118 Q 100,123 104,118" fill="none" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="78" cy="114" r="5" fill="#f472b6" opacity="0.6" />
                  <circle cx="122" cy="114" r="5" fill="#f472b6" opacity="0.6" />

                  {/* Ropes */}
                  <line x1="80" y1="175" x2="85" y2="200" stroke="#059669" strokeWidth="2" />
                  <line x1="120" y1="175" x2="115" y2="200" stroke="#059669" strokeWidth="2" />

                  {/* Basket carrying letter envelope */}
                  <rect x="80" y="200" width="40" height="20" rx="4" fill="#fef08a" stroke="#d97706" strokeWidth="2" />
                  {/* Envelope sticking out */}
                  <rect x="88" y="192" width="24" height="16" rx="2" fill="#ffffff" stroke="#e11d48" strokeWidth="1.5" />
                  <polygon points="88,192 100,202 112,192" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1" />
                </svg>
              </div>
            </motion.div>

            {/* Delivery Title */}
            <h1 className="text-3xl sm:text-5xl font-serif text-emerald-900 font-bold text-center mb-2 tracking-tight">
              Happy Friendship Day ✿
            </h1>
            <p className="font-serif italic text-lg sm:text-xl text-emerald-700 text-center mb-8">
              a special delivery for <span className="font-bold text-rose-500 underline decoration-wavy">{recipientName}</span>...
            </p>

            {/* Pulsing Tap to Begin */}
            <motion.button
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              onClick={() => setShowPopUpNote(true)}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] border-2 border-emerald-700 text-sm tracking-wider uppercase transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-200" />
              <span>TAP ANYWHERE TO BEGIN</span>
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </motion.button>

            {/* POP UP ENVELOPE & LETTER MODAL */}
            {showPopUpNote && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto min-h-screen"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="relative w-full max-w-md mx-auto my-auto flex flex-col items-center justify-center py-4"
                >
                  {/* Top Notification Badge */}
                  <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full border-2 border-emerald-300 shadow-md mb-6 z-10">
                    <p className="font-serif italic text-emerald-950 font-bold text-sm sm:text-base flex items-center gap-2">
                      <span>💌</span> A Special Letter for <span className="text-rose-500 font-sans font-bold underline decoration-wavy">{recipientName}</span>
                    </p>
                  </div>

                  {/* REALISTIC ENVELOPE & SLIDE-UP LETTER CONTAINER */}
                  <div className="relative w-full flex flex-col items-center">
                    
                    {/* 1. SLIDE-UP PAPER LETTER */}
                    <motion.div
                      initial={{ y: 80, opacity: 0, scale: 0.85 }}
                      animate={
                        isEnvelopeOpened
                          ? { y: 0, opacity: 1, scale: 1 }
                          : { y: 80, opacity: 0, scale: 0.85 }
                      }
                      transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 20,
                        delay: isEnvelopeOpened ? 0.3 : 0,
                      }}
                      className={`w-full bg-[#fefce8] rounded-3xl p-6 sm:p-7 border-4 border-amber-300 shadow-[8px_8px_0px_0px_rgba(253,224,71,0.8)] text-left space-y-4 relative ${
                        isEnvelopeOpened ? 'z-40 pointer-events-auto' : 'z-0 pointer-events-none'
                      }`}
                    >
                      {/* Decorative Tape on Letter */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-amber-200/90 border border-amber-400 rounded-sm rotate-[-1.5deg] shadow-sm"></div>

                      {/* Letter Header */}
                      <div className="flex items-center justify-between border-b-2 border-amber-300/80 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">💌</span>
                          <h3 className="font-serif italic text-xl sm:text-2xl text-amber-950 font-bold">
                            Dear {recipientName},
                          </h3>
                        </div>
                        <span className="text-xs font-serif italic text-amber-800 font-semibold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                          Special Note ✿
                        </span>
                      </div>

                      {/* Letter Body */}
                      <div className="font-serif italic text-base sm:text-lg text-amber-900 leading-relaxed bg-amber-50/90 p-4 rounded-2xl border border-amber-200 shadow-inner min-h-[110px]">
                        <p>
                          {customization.finalMessage ||
                            customization.customParagraph ||
                            `Every year this day comes around and I think the same thing: I got so lucky with you. Thank you for being my constant, my laugh-until-I-cry partner, and my favorite person to navigate life with. Happy Friendship Day! ✿`}
                        </p>
                      </div>

                      {/* Signature */}
                      <div className="text-right pt-1 font-serif italic text-amber-900 font-bold text-base">
                        — Forever your bestie, <span className="text-rose-600 font-bold">{senderName}</span> 💖
                      </div>

                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowIntro(false);
                          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
                          goToPage(1);
                        }}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[3px_3px_0px_0px_rgba(4,120,87,1)] border-2 border-emerald-700 text-base transition-all flex items-center justify-center space-x-2 mt-2 cursor-pointer"
                      >
                        <span>Open My Surprise 💖</span>
                        <Sparkles className="w-5 h-5 text-yellow-200" />
                      </motion.button>
                    </motion.div>

                    {/* 2. ENVELOPE GRAPHIC (Hidden or folded below when letter is fully opened) */}
                    {!isEnvelopeOpened && (
                      <div className="relative w-72 sm:w-80 h-52 sm:h-56 bg-rose-200 rounded-3xl border-4 border-rose-300 shadow-[8px_8px_0px_0px_rgba(244,114,182,0.6)] flex flex-col justify-between overflow-hidden p-4 z-20">
                        {/* Top Envelope Flap SVG */}
                        <motion.div
                          animate={isEnvelopeOpened ? { rotateX: 180, y: -20, opacity: 0 } : { rotateX: 0, y: 0, opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="absolute top-0 left-0 w-full h-28 z-20 pointer-events-none origin-top"
                        >
                          <svg viewBox="0 0 300 120" className="w-full h-full drop-shadow-md">
                            <polygon points="0,0 150,90 300,0" fill="#ffe4e6" stroke="#fda4af" strokeWidth="3" />
                          </svg>
                        </motion.div>

                        {/* Bottom Fold SVG */}
                        <svg viewBox="0 0 300 150" className="absolute bottom-0 left-0 w-full h-32 pointer-events-none z-10">
                          <polygon points="0,150 150,40 300,150" fill="#fecdd3" stroke="#fda4af" strokeWidth="2" opacity="0.95" />
                          <line x1="0" y1="0" x2="150" y2="100" stroke="#fda4af" strokeWidth="2" />
                          <line x1="300" y1="0" x2="150" y2="100" stroke="#fda4af" strokeWidth="2" />
                        </svg>

                        {/* Royal Wax Seal Graphic & Crack Animation Effect in Center */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                          <div className="relative cursor-pointer group">
                            {/* Wax seal outer glow aura */}
                            <div className="absolute -inset-2 rounded-full bg-rose-500/30 blur-md group-hover:bg-rose-500/50 transition-all animate-pulse pointer-events-none" />

                            {/* Main Wax Seal Button */}
                            <button
                              type="button"
                              disabled={isWaxSealCracking || isEnvelopeOpened}
                              onClick={() => {
                                if (isWaxSealCracking || isEnvelopeOpened) return;
                                setIsWaxSealCracking(true);
                                playCrackSound();

                                confetti({
                                  particleCount: 65,
                                  spread: 85,
                                  origin: { y: 0.5 },
                                  colors: ['#881337', '#be123c', '#fbbf24', '#fef08a', '#f472b6'],
                                });

                                setTimeout(() => {
                                  setIsEnvelopeOpened(true);
                                  setIsWaxSealCracking(false);
                                }, 550);
                              }}
                              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300 group-hover:scale-110 active:scale-95 focus:outline-none"
                            >
                              {/* 3D Wax Stamp Texture Container */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-800 via-rose-700 to-rose-950 border-4 border-rose-900 shadow-[0_8px_20px_rgba(136,19,55,0.6),inset_0_2px_4px_rgba(255,255,255,0.4)] overflow-hidden">
                                {/* Glossy Shine Highlight */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.45),transparent_60%)] pointer-events-none" />
                              </div>

                              {/* Inner Stamped Golden Dashed Ring */}
                              <div className="absolute inset-2.5 rounded-full border-2 border-dashed border-amber-300/70 shadow-inner flex items-center justify-center pointer-events-none" />

                              {/* Center Emblem / Crack Animation Switcher */}
                              <AnimatePresence mode="wait">
                                {!isWaxSealCracking ? (
                                  <motion.div
                                    key="intact-wax-seal"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                    className="relative z-10 flex flex-col items-center justify-center text-amber-200"
                                  >
                                    {/* Embossed Golden Heart Emblem */}
                                    <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] fill-amber-300 stroke-amber-100 stroke-[1.5]">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                    <span className="text-[9px] sm:text-[10px] font-serif font-black tracking-widest uppercase text-amber-200 drop-shadow-sm -mt-0.5">
                                      BFF SEAL
                                    </span>
                                  </motion.div>
                                ) : (
                                  /* CRACK ANIMATION VISUAL EFFECT */
                                  <div key="cracking-wax-seal" className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-visible">
                                    {/* Golden Crack Fissure Lightning Paths */}
                                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-30 overflow-visible">
                                      <motion.path
                                        d="M 50,0 L 47,25 L 56,48 L 42,70 L 50,100"
                                        fill="none"
                                        stroke="#fef08a"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.15 }}
                                      />
                                      <motion.path
                                        d="M 47,25 L 18,35"
                                        fill="none"
                                        stroke="#fde047"
                                        strokeWidth="3"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.1, delay: 0.08 }}
                                      />
                                      <motion.path
                                        d="M 56,48 L 82,58"
                                        fill="none"
                                        stroke="#fde047"
                                        strokeWidth="3"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.1, delay: 0.12 }}
                                      />
                                    </svg>

                                    {/* Fractured Left Half Fragment */}
                                    <motion.div
                                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                                      animate={{ x: -38, y: -12, rotate: -32, opacity: 0 }}
                                      transition={{ duration: 0.5, ease: 'easeOut' }}
                                      className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-rose-950 to-rose-700 rounded-l-full border-y-2 border-l-2 border-rose-950 shadow-xl overflow-hidden flex items-center justify-end pr-1"
                                    >
                                      <div className="w-3.5 h-3.5 rounded-full bg-amber-300 opacity-80" />
                                    </motion.div>

                                    {/* Fractured Right Half Fragment */}
                                    <motion.div
                                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                                      animate={{ x: 38, y: 12, rotate: 32, opacity: 0 }}
                                      transition={{ duration: 0.5, ease: 'easeOut' }}
                                      className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-rose-950 to-rose-700 rounded-r-full border-y-2 border-r-2 border-rose-950 shadow-xl overflow-hidden flex items-center justify-start pl-1"
                                    >
                                      <div className="w-3.5 h-3.5 rounded-full bg-amber-300 opacity-80" />
                                    </motion.div>

                                    {/* Burst Glow Flash */}
                                    <motion.div
                                      initial={{ scale: 0.2, opacity: 1 }}
                                      animate={{ scale: 3, opacity: 0 }}
                                      transition={{ duration: 0.45 }}
                                      className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-amber-300 via-rose-300 to-yellow-100 blur-sm z-40"
                                    />
                                  </div>
                                )}
                              </AnimatePresence>
                            </button>

                            {/* Label Prompt below Wax Seal */}
                            <motion.span
                              animate={isWaxSealCracking ? { opacity: 0 } : { opacity: [0.8, 1, 0.8], scale: [1, 1.03, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="mt-3 text-xs font-bold text-rose-900 bg-amber-50/95 px-3.5 py-1 rounded-full border border-amber-300 shadow-md whitespace-nowrap flex items-center gap-1.5"
                            >
                              <span>Crack Wax Seal to Open</span>
                              <span className="text-amber-600">✨</span>
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PAGED CONTENT CONTAINER */}
      <div className={`max-w-3xl mx-auto px-2 sm:px-4 pt-3 sm:pt-6 space-y-4 sm:space-y-6 ${showIntro ? 'hidden' : 'block'}`}>
        
        {/* TOP EXIT BUTTON IF AVAILABLE */}
        {onClose && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-sm transition-colors cursor-pointer"
            >
              ✕ Exit View
            </button>
          </div>
        )}

        {/* PAGED VIEW SWITCHER */}
        <AnimatePresence mode="wait">
          {/* PAGE 1: HERO SECTION ("To My Favourite Person") + AUDIO PLAYER */}
          {currentPage === 1 && (
            <motion.section
              key="page-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 rounded-3xl p-4 sm:p-8 border-4 border-emerald-200 shadow-[6px_6px_0px_0px_rgba(167,243,208,0.8)] relative overflow-hidden space-y-6"
            >
          
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Cute Main Image Card */}
            <div className="relative w-full md:w-1/2 flex justify-center">
              <div className="relative bg-amber-50 p-2.5 pb-7 rounded-2xl border-2 border-amber-200 shadow-md transform -rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[260px] sm:max-w-xs w-full">
                {/* Cute Washi Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-emerald-200/80 border border-emerald-300 transform -rotate-1 shadow-sm rounded-sm" />
                
                <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-amber-200">
                  <SafeImage
                    src={memoriesList[0]?.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&q=80'}
                    fallbackUrl="https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&q=80"
                    alt="To the best one"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Tag "to the best one" */}
                <div className="absolute bottom-2 right-3 bg-emerald-500 text-white font-bold text-[10px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm flex items-center space-x-1 border border-emerald-700">
                  <span>🏷️</span>
                  <span>to the best one</span>
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="w-full md:w-1/2 space-y-3 text-center md:text-left">
              <span className="inline-block bg-rose-100 text-rose-600 font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-rose-200">
                ✿ {customization.occasion === 'birthday' ? 'BIRTHDAY SPECIAL' : 'FRIENDSHIP DAY SPECIAL'} ✿
              </span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-emerald-950 leading-tight">
                {customization.finalHeading || 'To My Favourite Person 💖'}
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {customization.finalMessage || "Every year this day comes around and I think the same thing: I got so lucky with you. So instead of a text this time, I built you a tiny corner of the internet. Stay a while, there's a bit to see."}
              </p>
            </div>
          </div>

          {/* AUDIO PLAYER UI ("NOW PLAYING - Our Song") */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-3.5 sm:p-5 rounded-2xl border-2 border-emerald-300 shadow-sm relative space-y-2.5">
            {customAudioUrl && (
              <audio
                ref={audioRef}
                src={customAudioUrl}
                loop
                onTimeUpdate={() => {
                  if (audioRef.current && audioRef.current.duration) {
                    setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                  }
                }}
              />
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="text-base shrink-0">🎵</span>
                <span className="font-serif font-bold text-[10px] sm:text-xs uppercase tracking-wider text-emerald-800 truncate">
                  NOW PLAYING — {customization.musicTrack || customization.spotifyTrackName || 'Our Song'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                {customAudioUrl ? 'Uploaded Audio 🎵' : (customization.ambientSoundscape && customization.ambientSoundscape !== 'none' ? customization.ambientSoundscape.replace('_', ' ') : 'Kawaii Beats 🐾')}
              </span>
            </div>

            {/* Player Controls & Visualizer */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(4,120,87,1)] border border-emerald-700 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex justify-between text-[10px] sm:text-xs font-bold text-emerald-900">
                  <span className="truncate pr-1">{customization.musicTrack || customization.spotifyTrackName || 'FRIENDSHIP ANTHEM'}</span>
                  <span className="shrink-0 font-mono">0{Math.floor((audioProgress * 1.8) / 60)}:{Math.floor((audioProgress * 1.8) % 60) < 10 ? '0' : ''}{Math.floor((audioProgress * 1.8) % 60)}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-emerald-200/80 rounded-full h-2.5 sm:h-3 overflow-hidden border border-emerald-300">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300 relative"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cute Kawaii Characters Decorating Player */}
            <div className="flex justify-end space-x-2 pt-0.5 text-xs opacity-80">
              <span>🐱</span>
              <span>🐰</span>
              <span>🌸</span>
              <span>✨</span>
            </div>
          </div>

              {/* NEXT PAGE BUTTON */}
              <div className="pt-2 text-center flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    confetti({ particleCount: 40, spread: 65, origin: { y: 0.7 } });
                    goToPage(2);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] border-2 border-emerald-700 text-sm sm:text-base transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <span>Memory Wall 📸</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.section>
          )}

          {/* PAGE 2: THE MEMORY WALL (3D Flip Cards) */}
          {currentPage === 2 && (
            <motion.section
              key="page-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 text-center bg-white/90 rounded-3xl p-4 sm:p-8 border-4 border-emerald-200 shadow-[6px_6px_0px_0px_rgba(167,243,208,0.8)]"
            >
              <div>
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-emerald-950 tracking-wide">
                  ✦ THE MEMORY WALL ✦
                </h2>
                <p className="font-serif italic text-emerald-700 text-xs sm:text-base mt-0.5">
                  flip each card over to uncover memories
                </p>
              </div>

              {/* 2x3 Grid of 3D Flip Cards (2 per line on mobile) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
                {memoriesList.slice(0, 6).map((mem, idx) => {
                  const isFlipped = flippedCards[idx];
                  return (
                    <div
                      key={mem.id || idx}
                      className="w-full h-48 sm:h-64 [perspective:1000px] cursor-pointer"
                      onClick={() => toggleFlipCard(idx)}
                    >
                      <motion.div
                        className="relative w-full h-full duration-500 [transform-style:preserve-3d]"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {/* FRONT SIDE */}
                        <div className="absolute inset-0 w-full h-full bg-white rounded-2xl p-2 sm:p-3 border-2 border-emerald-200 shadow-[3px_3px_0px_0px_rgba(167,243,208,0.8)] [backface-visibility:hidden] flex flex-col justify-between">
                          <div className="w-full h-32 sm:h-44 rounded-xl overflow-hidden border border-emerald-100 bg-amber-50">
                            <SafeImage
                              src={mem.imageUrl}
                              fallbackUrl="https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&q=80"
                              alt={`Memory ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-emerald-700 px-0.5 pt-0.5">
                            <span>Memory #{idx + 1} ✿</span>
                            <span className="text-rose-400">Flip 🔄</span>
                          </div>
                        </div>

                        {/* BACK SIDE */}
                        <div className="absolute inset-0 w-full h-full bg-amber-50/90 rounded-2xl p-3 sm:p-5 border-2 border-emerald-300 shadow-[4px_4px_0px_0px_rgba(167,243,208,0.8)] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                          <span className="text-xl sm:text-2xl">✨</span>
                          <p className="font-serif italic text-xs sm:text-base text-slate-800 leading-snug line-clamp-4">
                            "{mem.caption || 'day one energy. we had no idea what was coming.'}"
                          </p>
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Forever Memory 💖
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* NAVIGATION BUTTONS FOR PAGE 2 */}
              <div className="pt-3 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-2xl border border-emerald-300 text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Greeting 🎵</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    confetti({ particleCount: 40, spread: 65, origin: { y: 0.7 } });
                    goToPage(3);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(190,18,60,1)] border-2 border-rose-700 text-xs sm:text-base transition-all flex items-center justify-center space-x-1.5 cursor-pointer group"
                >
                  <span>Secrets 🎨</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.section>
          )}

          {/* PAGE 3: SIX LITTLE TRUTHS (Scratch-off Cards with Photos & Stickers) */}
          {currentPage === 3 && (
            <motion.section
              key="page-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 text-center bg-white/90 rounded-3xl p-4 sm:p-8 border-4 border-emerald-200 shadow-[6px_6px_0px_0px_rgba(167,243,208,0.8)]"
            >
              <div className="flex items-center justify-between gap-2 text-left">
                <div>
                  <h2 className="text-xl sm:text-3xl font-serif font-bold text-emerald-950 tracking-wide">
                    ✦ SIX LITTLE TRUTHS ✦
                  </h2>
                  <p className="font-serif italic text-emerald-700 text-xs sm:text-base mt-0.5">
                    rub each one – reveal secret notes underneath
                  </p>
                </div>

                <button
                  type="button"
                  onClick={revealAllTruths}
                  className="text-[11px] font-bold text-emerald-800 bg-emerald-200/80 hover:bg-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-400 transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <span>✨ Reveal All</span>
                </button>
              </div>

              {/* 2x3 Grid of Scratch Cards (2 per line on mobile) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
                {truthsList.map((truth, idx) => (
                  <ScratchCard
                    key={idx}
                    index={idx}
                    truthNumber={truth.num}
                    truthText={truth.text}
                    photoUrl={scratchCardAttachments[idx]?.photoUrl}
                    sticker={scratchCardAttachments[idx]?.sticker}
                    isRevealed={Boolean(revealedTruths[idx])}
                    onReveal={() => handleRevealTruth(idx)}
                    onOpenAttachmentModal={(i) => setAttachmentModalIndex(i)}
                  />
                ))}
              </div>

              {/* NAVIGATION BUTTONS FOR PAGE 3 */}
              <div className="pt-3 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <button
                  type="button"
                  onClick={() => goToPage(2)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-2xl border border-emerald-300 text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Memories 📸</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
                    goToPage(4);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(180,83,9,1)] border-2 border-amber-700 text-xs sm:text-base transition-all flex items-center justify-center space-x-1.5 cursor-pointer group"
                >
                  <span>Letter 💌</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.section>
          )}

          {/* PAGE 4: FINAL NOTE (Lined Notebook Paper Style) */}
          {currentPage === 4 && (
            <motion.section
              key="page-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl sm:text-3xl font-serif font-bold text-emerald-950 tracking-wide">
                  ✿ ONE LAST THING ✿
                </h2>
                <p className="font-serif italic text-emerald-700 text-xs sm:text-base mt-0.5">
                  A Personal Letter for You
                </p>
              </div>

              {/* Lined Notebook Paper Container */}
              <div className="relative bg-[#fffdfa] rounded-3xl p-4 sm:p-10 border-2 border-amber-200 shadow-[8px_8px_0px_0px_rgba(251,207,232,0.8)] overflow-hidden">
                {/* Red Left Margin Line */}
                <div className="absolute top-0 bottom-0 left-7 sm:left-14 w-0.5 bg-rose-300 opacity-60 z-10" />

                {/* Lined notebook rules background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_27px,#e0f2fe_28px)] bg-[size:100%_28px] pointer-events-none opacity-80" />

                {/* Heart Seal Sticker */}
                <div className="absolute top-3 right-4 text-2xl sm:text-3xl transform rotate-12">
                  💌
                </div>

                {/* Content inside paper */}
                <div className="relative z-20 pl-6 sm:pl-12 pr-2 sm:pr-4 space-y-4 sm:space-y-6 font-serif italic text-sm sm:text-xl text-slate-800 leading-relaxed sm:leading-[28px]">
                  <p className="font-bold text-lg sm:text-2xl text-emerald-900">
                    Dearest {recipientName},
                  </p>

                  <p className="whitespace-pre-line text-sm sm:text-lg">
                    {customization.customParagraph || customization.customPoem || (
                      `Thank you for being the most incredible friend I could ever ask for. Through every triumph and every stumble, having you by my side has made life infinitely brighter and sweeter. I cherish every laugh, every secret, and every quiet moment we share. Here's to a lifetime of more unhinged memories together!`
                    )}
                  </p>

                  <div className="pt-4 border-t border-rose-200 flex flex-col items-end text-right space-y-0.5">
                    <p className="text-xs sm:text-base font-bold text-slate-500">
                      Yours truly,
                    </p>
                    <p className="text-xl sm:text-3xl font-serif italic text-rose-600 font-extrabold tracking-wide">
                      {senderName} 💖
                    </p>
                  </div>
                </div>
              </div>

              {/* NAVIGATION BUTTONS FOR PAGE 4 */}
              <div className="pt-3 grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <button
                  type="button"
                  onClick={() => goToPage(3)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-2xl border border-emerald-300 text-xs sm:text-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Secrets 🎨</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
                    goToPage(1);
                  }}
                  className="w-full sm:w-auto px-4 sm:px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(4,120,87,1)] border-2 border-emerald-800 text-xs sm:text-base transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Replay Wish 💖</span>
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ATTACH PHOTO OR STICKER MODAL */}
        {attachmentModalIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-emerald-300 shadow-2xl space-y-5 relative">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg font-serif">
                  <Camera className="w-5 h-5 text-rose-500" />
                  <span>Attach Photo or Sticker</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachmentModalIndex(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pick Decorative Sticker Emoji */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-500" />
                  <span>Select Decorative Sticker:</span>
                </label>
                <div className="grid grid-cols-8 gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  {STICKER_PALETTE.map((stk) => (
                    <button
                      key={stk}
                      type="button"
                      onClick={() => {
                        setScratchCardAttachments((prev) => ({
                          ...prev,
                          [attachmentModalIndex]: {
                            ...prev[attachmentModalIndex],
                            sticker: stk,
                          },
                        }));
                      }}
                      className={`text-2xl p-1.5 rounded-xl transition-transform hover:scale-125 cursor-pointer ${
                        scratchCardAttachments[attachmentModalIndex]?.sticker === stk
                          ? 'bg-rose-200 ring-2 ring-rose-500 scale-110'
                          : 'hover:bg-amber-100'
                      }`}
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pick Photo from Memories or Custom URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Select Photo to Attach:</span>
                </label>

                {/* Grid of uploaded memory photos */}
                {memoriesList.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    {memoriesList.map((mem, mIdx) => (
                      <button
                        key={mem.id || mIdx}
                        type="button"
                        onClick={() => {
                          setScratchCardAttachments((prev) => ({
                            ...prev,
                            [attachmentModalIndex]: {
                              ...prev[attachmentModalIndex],
                              photoUrl: mem.imageUrl,
                            },
                          }));
                        }}
                        className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          scratchCardAttachments[attachmentModalIndex]?.photoUrl === mem.imageUrl
                            ? 'border-rose-500 ring-2 ring-rose-300 scale-95'
                            : 'border-emerald-200 hover:border-emerald-400'
                        }`}
                      >
                        <SafeImage src={mem.imageUrl} fallbackUrl="https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&q=80" alt={`Mem ${mIdx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Image URL input */}
                <div className="pt-2 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Or enter image URL:</span>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={scratchCardAttachments[attachmentModalIndex]?.photoUrl || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setScratchCardAttachments((prev) => ({
                        ...prev,
                        [attachmentModalIndex]: {
                          ...prev[attachmentModalIndex],
                          photoUrl: url,
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              {/* Done Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentModalIndex(null);
                    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Attachment ✨
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center pt-8 text-xs text-emerald-700 space-y-2">
          <p className="font-serif italic">
            Made with 💖 on <a href="/" className="font-bold underline hover:text-emerald-900">OnlineWishes.in</a>
          </p>
          <p className="text-[10px] text-emerald-600/80">
            Send custom digital scrapbooks & surprise pages instantly on WhatsApp
          </p>
        </div>

      </div>
    </div>
  );
}
