import React, { useState } from 'react';
import { DigitalSticker, UserCustomization } from '../types';
import { Sparkles, Trash2, Plus, Move, RotateCw, Maximize2, RefreshCw, Heart, Star, Smile, Check } from 'lucide-react';

export interface PresetSticker {
  stickerId: string;
  emojiOrSvg: string;
  label: string;
  category: 'love' | 'doodles' | 'celebration' | 'badges';
}

export const PRESET_STICKERS: PresetSticker[] = [
  // Love & Romantic
  { stickerId: 'heart_gem', emojiOrSvg: '💖', label: 'Sparkle Heart', category: 'love' },
  { stickerId: 'love_letter', emojiOrSvg: '💌', label: 'Love Letter', category: 'love' },
  { stickerId: 'kiss_mark', emojiOrSvg: '💋', label: 'Kiss Mark', category: 'love' },
  { stickerId: 'rose_flower', emojiOrSvg: '🌹', label: 'Red Rose', category: 'love' },
  { stickerId: 'cherry_blossom', emojiOrSvg: '🌸', label: 'Cherry Blossom', category: 'love' },
  { stickerId: 'pink_ribbon', emojiOrSvg: '🎀', label: 'Pink Ribbon', category: 'love' },
  
  // Cute Doodles
  { stickerId: 'golden_star', emojiOrSvg: '⭐', label: 'Golden Star', category: 'doodles' },
  { stickerId: 'magic_sparkles', emojiOrSvg: '✨', label: 'Magic Sparkles', category: 'doodles' },
  { stickerId: 'rainbow_doodle', emojiOrSvg: '🌈', label: 'Rainbow', category: 'doodles' },
  { stickerId: 'cute_cat', emojiOrSvg: '🐱', label: 'Cute Kitty', category: 'doodles' },
  { stickerId: 'teddy_bear', emojiOrSvg: '🧸', label: 'Teddy Bear', category: 'doodles' },
  { stickerId: 'coffee_cup', emojiOrSvg: '☕', label: 'Coffee Cup', category: 'doodles' },
  { stickerId: 'vintage_camera', emojiOrSvg: '📸', label: 'Polaroid Camera', category: 'doodles' },

  // Celebration & Badges
  { stickerId: 'royal_crown', emojiOrSvg: '👑', label: 'Queen Crown', category: 'badges' },
  { stickerId: 'party_popper', emojiOrSvg: '🎉', label: 'Party Popper', category: 'celebration' },
  { stickerId: 'celebration_balloon', emojiOrSvg: '🎈', label: 'Red Balloon', category: 'celebration' },
  { stickerId: 'cupcake', emojiOrSvg: '🧁', label: 'Sweet Cupcake', category: 'celebration' },
  { stickerId: 'music_notes', emojiOrSvg: '🎵', label: 'Melody Note', category: 'celebration' },
  { stickerId: 'lucky_clover', emojiOrSvg: '🍀', label: 'Four Leaf Clover', category: 'badges' },
];

interface DigitalStickersPanelProps {
  customization: UserCustomization;
  onChangeCustomization: (updated: UserCustomization) => void;
}

export function DigitalStickersPanel({
  customization,
  onChangeCustomization,
}: DigitalStickersPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activePageTarget, setActivePageTarget] = useState<number>(0);

  const currentStickers = customization.placedStickers || [];

  const filteredPresets = selectedCategory === 'all'
    ? PRESET_STICKERS
    : PRESET_STICKERS.filter(s => s.category === selectedCategory);

  const handleAddSticker = (preset: PresetSticker) => {
    // Generate random default position around center with slight rotation variation
    const newSticker: DigitalSticker = {
      id: `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      stickerId: preset.stickerId,
      emojiOrSvg: preset.emojiOrSvg,
      label: preset.label,
      x: 35 + Math.floor(Math.random() * 30), // 35-65%
      y: 35 + Math.floor(Math.random() * 30), // 35-65%
      rotation: -15 + Math.floor(Math.random() * 30), // -15 to +15 deg
      scale: 1,
      pageIndex: activePageTarget,
    };

    const updated = [...currentStickers, newSticker];
    onChangeCustomization({
      ...customization,
      placedStickers: updated,
    });
    setSelectedStickerId(newSticker.id);
  };

  const handleRemoveSticker = (id: string) => {
    const updated = currentStickers.filter(s => s.id !== id);
    onChangeCustomization({
      ...customization,
      placedStickers: updated,
    });
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
    }
  };

  const handleUpdateSticker = (id: string, updates: Partial<DigitalSticker>) => {
    const updated = currentStickers.map(s => s.id === id ? { ...s, ...updates } : s);
    onChangeCustomization({
      ...customization,
      placedStickers: updated,
    });
  };

  const handleClearAllStickers = () => {
    if (window.confirm('Remove all digital stickers from scrapbook pages?')) {
      onChangeCustomization({
        ...customization,
        placedStickers: [],
      });
      setSelectedStickerId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-6">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Digital Stickers & Doodles
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag & decorate your scrapbook pages with romantic badges and stickers
            </p>
          </div>
        </div>

        {currentStickers.length > 0 && (
          <button
            onClick={handleClearAllStickers}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All ({currentStickers.length})</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Stickers' },
          { id: 'love', label: '💖 Love' },
          { id: 'doodles', label: '⭐ Doodles' },
          { id: 'celebration', label: '🎉 Party' },
          { id: 'badges', label: '👑 Badges' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preset Stickers Catalog Grid */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Click sticker to place on scrapbook:
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {filteredPresets.map((preset) => (
            <button
              key={preset.stickerId}
              onClick={() => handleAddSticker(preset)}
              className="group relative p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-rose-300 rounded-xl flex flex-col items-center justify-center transition-all transform hover:-translate-y-1 hover:shadow-md cursor-pointer"
            >
              <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-125 transition-transform">
                {preset.emojiOrSvg}
              </span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                {preset.label}
              </span>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sticker Position Canvas / Selected Sticker Controls */}
      {currentStickers.length > 0 ? (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Placed Stickers ({currentStickers.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Select a sticker below to rotate or adjust scale:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentStickers.map((sticker) => {
              const isSelected = selectedStickerId === sticker.id;
              return (
                <div
                  key={sticker.id}
                  onClick={() => setSelectedStickerId(sticker.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{sticker.emojiOrSvg}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sticker.label}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSticker(sticker.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                      title="Remove Sticker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rotation & Scale Sliders */}
                  <div className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between space-x-2">
                      <span className="flex items-center space-x-1 shrink-0">
                        <RotateCw className="w-3 h-3 text-rose-500" />
                        <span>Rotation ({sticker.rotation}°)</span>
                      </span>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={sticker.rotation}
                        onChange={(e) => handleUpdateSticker(sticker.id, { rotation: parseInt(e.target.value) })}
                        className="w-24 accent-rose-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <span className="flex items-center space-x-1 shrink-0">
                        <Maximize2 className="w-3 h-3 text-rose-500" />
                        <span>Scale ({sticker.scale.toFixed(1)}x)</span>
                      </span>
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.1"
                        value={sticker.scale}
                        onChange={(e) => handleUpdateSticker(sticker.id, { scale: parseFloat(e.target.value) })}
                        className="w-24 accent-rose-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <Smile className="w-8 h-8 text-rose-400 mx-auto mb-2 opacity-80" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            No stickers placed yet
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Click any sticker above to stick it on your scrapbook pages!
          </p>
        </div>
      )}

    </div>
  );
}
