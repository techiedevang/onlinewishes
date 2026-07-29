import React, { useState } from 'react';
import { Memory, PhysicalPage, PageData, DigitalSticker } from '../types';
import { Heart, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { SafeImage } from './SafeImage';

const defaultMemories: Memory[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop',
    caption: 'You make every day brighter 💖',
    date: 'Oct 14th'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=600&fit=crop',
    caption: 'Concert night! We lost our voices 😂',
    date: 'Summer 2023'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&h=600&fit=crop',
    caption: 'Coffee dates are the best with you ☕',
    date: 'Nov 22nd'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&h=600&fit=crop',
    caption: 'Trip to the beach! 🌊',
    date: 'July 4th'
  }
];

interface BookProps {
  memories?: Memory[];
  stickers?: DigitalSticker[];
  signatureUrl?: string;
  senderName?: string;
}

// Subtle Web Audio page flip sound generator
function playPageFlipSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Low frequency swipe rustle
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio error
  }
}

export default function Book({ memories = [], stickers = [], signatureUrl, senderName }: BookProps) {
  const [activePage, setActivePage] = useState(0);

  const mems = memories && memories.length > 0 ? memories : defaultMemories;

  const pages: PhysicalPage[] = [];
  pages.push({
    front: { type: 'cover' },
    back: mems.length > 0 ? { type: 'memory', data: mems[0] } : { type: 'blank' }
  });
  
  for (let i = 1; i < mems.length; i += 2) {
    pages.push({
      front: { type: 'memory', data: mems[i] },
      back: mems[i + 1] ? { type: 'memory', data: mems[i + 1] } : { type: 'blank' }
    });
  }
  
  const lastPage = pages[pages.length - 1];
  if (lastPage.back.type !== 'blank') {
    pages.push({ front: { type: 'blank' }, back: { type: 'back_cover' } });
  } else {
    lastPage.back = { type: 'back_cover' };
  }

  const handlePageTurn = (targetPageIndex: number) => {
    playPageFlipSound();
    setActivePage(targetPageIndex);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative my-2">
      {/* 3D Perspective Book Stage */}
      <div className="w-full flex justify-center items-center relative perspective-container z-10 py-4">
        <div className="relative w-[170px] h-[240px] sm:w-[260px] sm:h-[360px] md:w-[380px] md:h-[500px] shrink-0 preserve-3d transition-transform duration-500">
          {pages.map((page, i) => {
            const isFlipped = i < activePage;
            const zIndex = isFlipped ? i : pages.length - i;
            
            return (
              <div
                key={i}
                className={`absolute inset-0 origin-left book-page preserve-3d cursor-pointer drop-shadow-2xl ${isFlipped ? 'rotate-y-minus-180' : ''}`}
                style={{ zIndex }}
                onClick={() => handlePageTurn(isFlipped ? i : i + 1)}
              >
                {/* Front of the physical page */}
                <div className="absolute inset-0 backface-hidden paper-texture rounded-r-2xl border-y border-r border-rose-200/50 overflow-hidden shadow-inner">
                  {/* Real spine gradient fold */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent opacity-30 z-10 pointer-events-none" />
                  <PageContent data={page.front} side="front" stickers={stickers} pageIndex={i * 2} signatureUrl={signatureUrl} senderName={senderName} />
                </div>
                
                {/* Back of the physical page */}
                <div className="absolute inset-0 backface-hidden paper-texture rounded-r-2xl border-y border-r border-rose-200/50 rotate-y-180 overflow-hidden shadow-inner">
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 via-black/5 to-transparent z-20 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent opacity-30 z-10 pointer-events-none" />
                  <PageContent data={page.back} side="back" stickers={stickers} pageIndex={i * 2 + 1} signatureUrl={signatureUrl} senderName={senderName} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Book Navigation & Page Indicator Controls */}
      <div className="mt-4 flex items-center justify-between w-full max-w-md px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-700/80 text-white shadow-xl z-20">
        <button
          onClick={() => activePage > 0 && handlePageTurn(activePage - 1)}
          disabled={activePage === 0}
          className="p-1.5 sm:p-2 rounded-full hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center space-x-1 text-xs font-bold"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Page</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold text-rose-300">
          <BookOpen className="w-3.5 h-3.5" />
          <span>
            {activePage === 0 ? 'Cover' : activePage >= pages.length ? 'End' : `Page ${activePage} of ${pages.length - 1}`}
          </span>
        </div>

        <button
          onClick={() => activePage < pages.length && handlePageTurn(activePage + 1)}
          disabled={activePage >= pages.length}
          className="p-1.5 sm:p-2 rounded-full hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center space-x-1 text-xs font-bold"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next Page</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PageContent({ 
  data, 
  side, 
  stickers = [], 
  pageIndex = 0,
  signatureUrl,
  senderName
}: { 
  data: PageData; 
  side: 'front' | 'back'; 
  stickers?: DigitalSticker[]; 
  pageIndex?: number;
  signatureUrl?: string;
  senderName?: string;
}) {
  // Render digital stickers on this page
  const pageStickers = stickers.filter(s => s.pageIndex === undefined || s.pageIndex === pageIndex || pageIndex % 2 === (s.pageIndex || 0) % 2);

  if (data.type === 'cover') {
    return (
      <div className="w-full h-full bg-rose-400 flex flex-col justify-center items-center p-3 sm:p-6 md:p-8 relative">
        <div className="absolute inset-2 sm:inset-4 border-2 border-dashed border-rose-200/60 rounded-xl" />
        <Heart className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-rose-100 fill-rose-100 mb-4 sm:mb-6 animate-pulse drop-shadow-md" />
        <h1 className="font-handwriting text-4xl sm:text-6xl md:text-7xl text-white text-center shadow-sm leading-tight drop-shadow-lg">
          Our<br/>Scrapbook
        </h1>
        <p className="mt-4 sm:mt-8 md:mt-10 text-rose-100 font-medium text-[0.65rem] sm:text-sm md:text-lg text-center tracking-widest uppercase">
          Open to see memories ✨
        </p>

        {/* Cover Stickers */}
        {stickers.map((st) => (
          <div
            key={st.id}
            className="absolute pointer-events-none z-30 select-none text-2xl sm:text-4xl filter drop-shadow-md transition-transform"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale})`,
            }}
          >
            {st.emojiOrSvg}
          </div>
        ))}
      </div>
    );
  }
  
  if (data.type === 'back_cover') {
    return (
      <div className="w-full h-full bg-rose-400 flex flex-col justify-center items-center p-3 sm:p-6 text-center relative overflow-hidden">
        <div className="absolute inset-2 sm:inset-4 border-2 border-dashed border-rose-200/60 rounded-xl pointer-events-none" />
        <h1 className="font-handwriting text-2xl sm:text-4xl text-white text-center drop-shadow-md mb-2">
          To be continued...
        </h1>

        {signatureUrl ? (
          <div className="my-2 p-2 bg-white/95 rounded-xl border border-white/50 shadow-lg max-w-[180px] mx-auto text-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Signed With Love</span>
            <img src={signatureUrl} alt="Signature" className="max-h-12 w-auto mx-auto object-contain" />
            {senderName && (
              <p className="text-slate-800 text-xs font-black mt-1">— {senderName}</p>
            )}
          </div>
        ) : (
          senderName && (
            <p className="text-white font-serif italic text-sm mt-2">— {senderName}</p>
          )
        )}

        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-100 fill-rose-100 mt-2 drop-shadow-md" />
      </div>
    );
  }
  
  if (data.type === 'blank') {
    return (
      <div className="w-full h-full flex justify-center items-center opacity-50 relative">
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300 opacity-40" />
      </div>
    );
  }

  // Memory Type
  const m = data.data;
  if (!m) return <div className="w-full h-full bg-white flex justify-center items-center"><Heart className="w-8 h-8 text-rose-200 animate-pulse" /></div>;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-2 sm:p-5 md:p-8 relative overflow-hidden">
      {/* Washi tape graphic */}
      <div className="absolute top-4 sm:top-6 md:top-8 left-1/2 -translate-x-1/2 w-12 sm:w-20 md:w-28 h-4 sm:h-6 md:h-8 bg-rose-200/60 -rotate-2 z-10 shadow-sm" style={{ backdropFilter: 'blur(2px)' }} />

      <div className="bg-white p-2 sm:p-3 md:p-5 pb-6 sm:pb-12 md:pb-20 rounded-sm shadow-xl rotate-1 w-full max-w-full relative">
        <div className="w-full aspect-square bg-gray-100 rounded-sm overflow-hidden mb-2 sm:mb-4">
          <SafeImage src={m?.imageUrl || ''} fallbackUrl={m?.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop'} alt="Memory" className="w-full h-full object-cover" />
        </div>
        <p className="font-handwriting text-[1rem] sm:text-2xl md:text-3xl text-gray-800 text-center leading-tight -mt-1 sm:-mt-2 px-1 sm:px-2 line-clamp-2 md:line-clamp-3">
          {m?.caption}
        </p>
        <p className="text-gray-400 font-sans text-[0.45rem] sm:text-[0.65rem] md:text-xs text-center mt-1 sm:mt-2 uppercase tracking-widest">
          {m?.date}
        </p>
      </div>

      {/* Render Stickers placed on memory page */}
      {stickers.slice(0, 3).map((st, idx) => (
        <div
          key={st.id || idx}
          className="absolute pointer-events-none z-30 select-none text-2xl sm:text-3xl filter drop-shadow-md"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale})`,
          }}
        >
          {st.emojiOrSvg}
        </div>
      ))}
    </div>
  );
}
