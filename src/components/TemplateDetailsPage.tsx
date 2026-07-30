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
      className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Top Bar / Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Column: Details & Features */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4 text-center lg:text-left">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
                {template.category.toUpperCase()}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {template.title}
              </h1>
              
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                <button
                  onClick={() => onOpenReviewsModal(template)}
                  className="flex items-center space-x-1.5 text-amber-500 hover:text-amber-600 transition-colors"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-sm">{template.rating}</span>
                  <span className="text-slate-400 text-sm underline decoration-slate-300 dark:decoration-slate-600">({template.reviewsCount || 120} reviews)</span>
                </button>
                <div className="flex items-center space-x-1 text-slate-500 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>10k+ views</span>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed pt-2">
                {template.description}
              </p>
            </div>

            {/* Customization & Buy Option */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 bg-slate-900 dark:bg-slate-950 rounded-3xl shadow-xl text-white border border-slate-800">
              <div className="mb-6 sm:mb-0 text-center sm:text-left">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">One-time payment</p>
                <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                  <p className="text-4xl font-black">Rs. {template.price}</p>
                  <p className="text-slate-500 text-sm line-through">Rs. {Math.round(template.price * 1.5)}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectTemplateToBuild(template)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] transform hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-6 h-6" />
                <span>Customize & Edit Now</span>
              </button>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <Sparkles className="w-6 h-6 text-rose-500 mr-2" />
                What's Included
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {template.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                    <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center lg:justify-start">
                <Eye className="w-6 h-6 text-sky-500 mr-2" />
                Live Interactive Preview
              </h3>
              
              <div className="relative w-full aspect-[9/16] sm:aspect-[16/10] lg:aspect-[9/16] max-w-sm mx-auto lg:mx-0 bg-slate-950 rounded-[2.5rem] p-3 shadow-2xl border-[6px] border-slate-800 overflow-hidden group">
                <div className="absolute inset-0 bg-black pointer-events-none z-10 rounded-[2rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-900 isolation-auto">
                  <InteractiveSurpriseTemplate
                    customization={sampleCustomization}
                    isStandaloneView={true}
                  />
                </div>

                {/* Overlay Fullscreen Button */}
                <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 bg-slate-900/40 backdrop-blur-sm transition-opacity flex items-center justify-center rounded-[2rem]">
                  <button
                    onClick={() => onPreview(template)}
                    className="px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-xl shadow-2xl hover:scale-105 transition-transform flex items-center space-x-2"
                  >
                    <Maximize2 className="w-4 h-4 text-rose-500" />
                    <span>View Full Screen</span>
                  </button>
                </div>
              </div>
              <p className="text-center lg:text-left text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-sm mx-auto lg:mx-0">
                * This is a sample preview. You will be able to customize it with your own photos and messages.
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
