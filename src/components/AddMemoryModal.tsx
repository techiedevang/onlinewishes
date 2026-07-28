import React, { useState, useRef } from 'react';
import { X, Upload, Heart } from 'lucide-react';
import { Memory } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (m: Omit<Memory, 'id'>) => void;
}

export default function AddMemoryModal({ onClose, onAdd }: Props) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !caption || !date) return;
    onAdd({ imageUrl, caption, date });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-handwriting text-4xl text-rose-500 text-center mb-6 flex items-center justify-center gap-2">
          New Memory <Heart className="w-6 h-6 fill-rose-500" />
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            {imageUrl ? (
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-inner group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center text-white font-medium"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 flex flex-col justify-center items-center text-rose-400 hover:bg-rose-50 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="font-medium">Upload a photo</span>
                <span className="text-xs mt-1 text-rose-300">Choose from your device</span>
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none resize-none font-handwriting text-xl"
              placeholder="What happened on this day? 💕"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="text"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
              placeholder="e.g. Summer 2023, Oct 14th"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-95 text-lg flex items-center justify-center gap-2"
          >
            Add to Scrapbook ✨
          </button>
        </form>
      </div>
    </div>
  );
}
