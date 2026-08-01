import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageUrl, onCrop, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Refs for pinch-to-zoom
  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef<number>(1);
  
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      // It's a pinch
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDist.current = dist;
      pinchStartScale.current = scale;
      setIsDragging(false); // Stop dragging while pinching
      return;
    }

    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      if (pinchStartDist.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const newScale = Math.min(Math.max(0.1, pinchStartScale.current * (dist / pinchStartDist.current)), 5); // Increased max scale for pinch to 5
        setScale(newScale);
      }
      return;
    }

    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  }, [isDragging, dragStart, setScale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    pinchStartDist.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleApplyCrop = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We want a square crop for the frame
    const cropSize = 800;
    canvas.width = cropSize;
    canvas.height = cropSize;
    
    // Fill background with white or transparent
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cropSize, cropSize);

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // The crop mask is a square in the center of the container
    const maskSize = Math.min(containerRect.width, containerRect.height) * 0.8; // 80% of container
    
    // Calculate the ratio of original image to screen representation
    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;
    
    const scaleX = naturalWidth / imageRect.width;
    const scaleY = naturalHeight / imageRect.height;

    // Calculate crop area relative to the screen image
    const maskX = (containerRect.width - maskSize) / 2;
    const maskY = (containerRect.height - maskSize) / 2;
    
    // Position of image relative to container
    const imgX = (containerRect.width - imageRect.width) / 2 + position.x;
    const imgY = (containerRect.height - imageRect.height) / 2 + position.y;

    // Find the intersection
    const sourceX = (maskX - imgX) * scaleX;
    const sourceY = (maskY - imgY) * scaleY;
    const sourceWidth = maskSize * scaleX;
    const sourceHeight = maskSize * scaleY;

    // Draw image onto canvas
    ctx.drawImage(
      imageRef.current,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, cropSize, cropSize
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm p-4">
      <div className="flex justify-between items-center w-full max-w-2xl mb-4 text-white">
        <h3 className="font-bold text-lg">Edit & Crop Photo</h3>
        <button onClick={onCancel} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl h-[50vh] sm:h-[60vh] bg-black/50 overflow-hidden border border-white/20 rounded-xl cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="To crop"
          draggable={false}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease',
          }}
          className="max-w-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
        />
        
        {/* Crop Mask (Square overlay with hole) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
           <div className="w-[80%] aspect-square border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      <div className="w-full max-w-2xl mt-6 space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md">
          <button 
            onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.01" 
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          
          <button 
            onClick={() => setScale(s => Math.min(3, s + 0.1))}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => { setScale(1); setPosition({x:0, y:0}); }}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onCancel}
            className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleApplyCrop}
            className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Check className="w-5 h-5" />
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}