import React, { useEffect, useState } from 'react';
import { Template } from '../types';
import { Maximize2, Sparkles, Check, ArrowLeft, Star, MessageSquare, Heart, Eye } from 'lucide-react';
import { InteractiveSurpriseTemplate } from './InteractiveSurpriseTemplate';
import { getDefaultCustomization } from '../data/templates';
import { motion } from 'motion/react';

interface TemplateDetailsPageProps {
  template: Template;
  onBack: () => void;
  onPreview: (template: Template) => void;
  onSelectTemplateToBuild: (template: Template) => void;
  onOpenReviewsModal: (template: Template) => void;
}

export function TemplateDetailsPage({ template, onBack, onPreview, onSelectTemplateToBuild, onOpenReviewsModal }: TemplateDetailsPageProps) {
  const [sampleCustomization, setSampleCustomization] = useState(() => getDefaultCustomization(template.id));

  useEffect(() => {
    window.scrollTo(0, 0);
    setSampleCustomization(getDefaultCustomization(template.id));
  }, [template.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-amber-100 pt-20 pb-20 px-4"
    >
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        {/* Top Bar / Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 bg-white text-black border border-slate-200 rounded-lg px-4 py-2 font-body font-semibold text-xs sm:text-sm uppercase font-bold hover:bg-gray-100 transition-colors shadow-sm active:translate-y-[2px] active:shadow-none mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Column: Details & Features */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4 text-center lg:text-left bg-white border border-slate-200 p-6 rounded-3xl shadow-xl">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-black bg-lovely-mint border border-slate-200 px-3 py-1 rounded-full">
                {template.category.toUpperCase()}
              </span>
              <h1 className="font-body font-semibold text-3xl sm:text-5xl font-bold text-black leading-tight uppercase">
                {template.title}
              </h1>
              
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <button
                  onClick={() => onOpenReviewsModal(template)}
                  className="flex items-center space-x-1.5 text-black hover:text-rose-600 transition-colors font-bold text-sm"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-black" />
                  <span className="font-bold text-sm">{template.rating}</span>
                  <span className="underline decoration-black">({template.reviewsCount || 120} reviews)</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-700 text-sm font-bold">
                  <Eye className="w-4 h-4 text-black" />
                  <span>10k+ views</span>
                </div>
              </div>

              <p className="font-body font-bold text-gray-800 text-base sm:text-lg leading-relaxed pt-2">
                {template.description}
              </p>
            </div>

            {/* Customization & Buy Option */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-lovely-mint border border-slate-200 rounded-3xl shadow-xl text-black">
              <div className="mb-6 sm:mb-0 text-center sm:text-left">
                <p className="text-gray-900 text-xs font-bold uppercase tracking-wider mb-1 font-body">One-time payment</p>
                <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                  <p className="font-body font-semibold text-4xl font-bold">Rs. {template.price}</p>
                  <p className="text-gray-700 text-sm line-through font-bold">Rs. {Math.round(template.price * 1.5)}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectTemplateToBuild(template)}
                className="w-full sm:w-auto px-8 py-4 bg-rose-600 text-white font-body font-semibold font-bold text-lg uppercase border border-slate-200 rounded-2xl shadow-lg hover:translate-y-0.5 hover:shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-6 h-6" />
                <span>Customize & Edit Now</span>
              </button>
            </div>

            {/* Features */}
            <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl">
              <h3 className="font-body font-semibold text-2xl font-bold text-black mb-6 flex items-center uppercase">
                <Sparkles className="w-6 h-6 text-rose-600 mr-2" />
                What's Included
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {template.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-black font-body font-bold text-sm sm:text-base bg-lovely-lavender/40 border border-slate-200 p-4 rounded-2xl">
                    <Check className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-6">
              <h3 className="font-body font-semibold text-2xl font-bold text-black flex items-center justify-center lg:justify-start uppercase">
                <Eye className="w-6 h-6 text-black mr-2" />
                Live Interactive Preview
              </h3>
              
              <div className="relative w-full aspect-[9/16] sm:aspect-[16/10] lg:aspect-[9/16] max-w-sm mx-auto lg:mx-0 bg-black rounded-[2.5rem] p-3 shadow-xl border border-slate-200 overflow-hidden group">
                <div className="absolute inset-0 bg-black pointer-events-none z-10 rounded-[2rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-900 isolation-auto">
                  <InteractiveSurpriseTemplate
                    customization={sampleCustomization}
                    isStandaloneView={true}
                    isPreviewMode={true}
                  />
                </div>

                {/* Overlay Fullscreen Button */}
                <div 
                  className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 bg-white/40 backdrop-blur-sm transition-opacity flex items-center justify-center rounded-[2rem] cursor-pointer"
                  onClick={() => onPreview(template)}
                >
                  <button
                    className="px-6 py-3 bg-white text-black font-body font-semibold font-bold text-sm uppercase border border-slate-200 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center space-x-2 pointer-events-none"
                  >
                    <Maximize2 className="w-4 h-4 text-rose-600" />
                    <span>View Full Screen</span>
                  </button>
                </div>
              </div>
              <p className="text-center lg:text-left font-body font-bold text-xs text-gray-800 mt-4 max-w-sm mx-auto lg:mx-0">
                * This is a sample preview. You will be able to customize it with your own photos and messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
