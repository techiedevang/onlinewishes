import React, { useState } from 'react';
import { 
  X, Check, RotateCw, FlipHorizontal, FlipVertical, 
  ZoomIn, ZoomOut, Sliders, Sparkles, RefreshCcw, Crop
} from 'lucide-react';
import { Memory } from '../types';
import { SafeImage } from './SafeImage';

interface Props {
  memory: Memory;
  onSave: (updated: Memory) => void;
  onClose: () => void;
}

export default function PhotoEditorModal({ memory, onSave, onClose }: Props) {
  const [rotation, setRotation] = useState<number>(memory.rotation || 0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(memory.flipHorizontal || false);
  const [flipVertical, setFlipVertical] = useState<boolean>(memory.flipVertical || false);
  const [zoom, setZoom] = useState<number>(memory.zoom || 1);
  const [filter, setFilter] = useState<string>(memory.filter || 'none');
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill'>(memory.objectFit || 'cover');
  const [caption, setCaption] = useState<string>(memory.caption || '');

  const handleRotateCw = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipH = () => {
    setFlipHorizontal((prev) => !prev);
  };

  const handleFlipV = () => {
    setFlipVertical((prev) => !prev);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setZoom(1);
    setFilter('none');
    setObjectFit('cover');
  };

  const handleSave = () => {
    onSave({
      ...memory,
      rotation,
      flipHorizontal,
      flipVertical,
      zoom,
      filter,
      objectFit,
      caption,
    });
    onClose();
  };

  // Compute CSS transform
  const transformStyle = `rotate(${rotation}deg) ${flipHorizontal ? 'scaleX(-1)' : ''} ${flipVertical ? 'scaleY(-1)' : ''} scale(${zoom})`;

  // Compute CSS filter
  let filterCss = 'none';
  if (filter === 'vintage') filterCss = 'sepia(0.5) hue-rotate(-30deg) contrast(1.2)';
  else if (filter === 'sepia') filterCss = 'sepia(1)';
  else if (filter === 'grayscale') filterCss = 'grayscale(1)';
  else if (filter === 'contrast') filterCss = 'contrast(1.5)';
  else if (filter === 'bright') filterCss = 'brightness(1.2) contrast(1.1)';
  else if (filter === 'warm') filterCss = 'sepia(0.3) saturate(1.4)';
  else if (filter === 'cool') filterCss = 'hue-rotate(180deg) saturate(0.8)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Photo Studio & Editor</h3>
              <p className="text-xs text-slate-500">Crop, rotate, flip, and apply filters to your memory photo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Live Preview Area */}
          <div className="relative w-full h-[280px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4">
              <SafeImage
                src={memory.imageUrl}
                fallbackUrl={memory.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'}
                alt="Preview"
                className="max-h-full max-w-full transition-all duration-200 shadow-2xl rounded-lg"
                style={{
                  objectFit: objectFit,
                  transform: transformStyle,
                  filter: filterCss,
                }}
              />
            </div>
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-2">
              <span>Zoom: {zoom.toFixed(1)}x</span>
              <span>•</span>
              <span>Rot: {rotation}°</span>
              {flipHorizontal && <span>• H-Flip</span>}
              {flipVertical && <span>• V-Flip</span>}
            </div>
          </div>

          {/* Quick Tools Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleRotateCw}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <RotateCw className="w-4 h-4 text-rose-500" />
              <span>Rotate 90°</span>
            </button>
            <button
              onClick={handleFlipH}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${flipHorizontal ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'}`}
            >
              <FlipHorizontal className="w-4 h-4" />
              <span>Flip H</span>
            </button>
            <button
              onClick={handleFlipV}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${flipVertical ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'}`}
            >
              <FlipVertical className="w-4 h-4" />
              <span>Flip V</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-rose-500" /> Zoom / Crop Frame</span>
              <span className="font-mono text-rose-500">{zoom.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-rose-500 cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] font-medium text-slate-500">Aspect Mode:</span>
              {(['cover', 'contain', 'fill'] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => setObjectFit(fit)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${objectFit === fit ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Choose Filter Effect
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'Normal' },
                { id: 'vintage', label: 'Vintage' },
                { id: 'sepia', label: 'Sepia' },
                { id: 'grayscale', label: 'B&W' },
                { id: 'contrast', label: 'High Contrast' },
                { id: 'bright', label: 'Vibrant' },
                { id: 'warm', label: 'Warm Glow' },
                { id: 'cool', label: 'Cool Tone' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${filter === f.id ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Photo Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a cute memory caption..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Save Photo</span>
          </button>
        </div>

      </div>
    </div>
  );
}
