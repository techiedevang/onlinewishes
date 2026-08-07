import React, { useState } from 'react';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';
import { ExternalLink, Sparkles } from 'lucide-react';

interface TemplateGalleryProps {
  limit?: number;
  onSeeAllTemplates?: () => void;
  onPreviewTemplate: (template: Template) => void;
  onSelectTemplateToBuild: (template: Template) => void;
  onOpenReviewsModal: (template: Template) => void;
  onOpenCustomAiModal?: () => void;
  onViewDetails?: (template: Template) => void;
}

export function TemplateGallery({
  limit,
  onSeeAllTemplates,
  onPreviewTemplate,
  onSelectTemplateToBuild,
  onViewDetails,
}: TemplateGalleryProps) {
  const displayedTemplates = limit ? TEMPLATES.slice(0, limit) : TEMPLATES;

  // Colors for borders matching lovelydesign.in
  const borderColors = ['border-lovely-neon', 'border-lovely-violet', 'border-lovely-mint', 'border-lovely-pink'];

  return (
    <section id="templates" className="relative w-full bg-lovely-yellow py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-20 right-10">
        <svg width="50" height="50" viewBox="0 0 100 100" className="">
          <path d="M50 85 C50 85, 10 55, 10 35 C10 20, 22 10, 35 10 C42 10, 47 15, 50 20 C53 15, 58 10, 65 10 C78 10, 90 20, 90 35 C90 55, 50 85, 50 85Z" fill="#FF4D8D" stroke="#000" strokeWidth="4"></path>
          <ellipse cx="30" cy="30" rx="8" ry="5" fill="white" opacity="0.4"></ellipse>
        </svg>
      </div>
      <div className="absolute bottom-20 left-10">
        <svg width="45" height="45" viewBox="0 0 100 100" className="">
          <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" fill="#F2C94C" stroke="#000" strokeWidth="4"></path>
          <ellipse cx="45" cy="35" rx="6" ry="4" fill="white" opacity="0.5"></ellipse>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 uppercase text-black font-black">
            Pick Your <span className="text-lovely-neon">Templates</span>
          </h2>
          <p className="font-body font-bold text-base sm:text-lg text-gray-800 max-w-md mx-auto">
            Choose a template, add your story, share the love!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedTemplates.map((template, idx) => {
            const borderColor = borderColors[idx % borderColors.length];
            return (
              <div key={template.id} className={`template-card ${idx % 2 !== 0 ? 'lg:mt-8' : ''}`}>
                <div 
                  className={`bg-white border-4 ${borderColor} rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-300 group relative overflow-hidden flex flex-col h-full`}
                >
                  <div className="relative aspect-[6/4] overflow-hidden rounded-t-[12px] border-b-4 border-black">
                    <img 
                      alt={template.title} 
                      loading="lazy" 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                      src={template.thumbnail}
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800'; }}
                    />
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 rounded-full border-2 border-black">
                        <span className="font-body font-bold text-[0.7rem] sm:text-sm whitespace-nowrap text-black">Rs. {template.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-white flex flex-col flex-grow">
                    <h3 className="font-heading text-lg sm:text-xl uppercase text-center mb-2 line-clamp-1 text-black font-black flex items-center justify-center">
                      {template.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 font-bold text-center line-clamp-2 mb-4 font-body flex-grow">
                      {template.description}
                    </p>
                    
                    <div className="flex items-stretch gap-1.5 sm:gap-2 mt-auto">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreviewTemplate(template); }}
                        className="flex-1 bg-white border-2 border-black rounded-md py-1.5 font-heading text-xs sm:text-sm uppercase font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectTemplateToBuild(template); }}
                        className="flex-[1.5] bg-lovely-neon text-white font-heading font-bold text-xs sm:text-sm uppercase border-2 border-black rounded-md py-1.5 px-2 transition-all flex items-center justify-center gap-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#E6005C] active:translate-y-[2px] active:shadow-none"
                      >
                        <Sparkles className="w-3.5 h-3.5 hidden sm:block" />
                        <span>Create</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {onSeeAllTemplates && limit && TEMPLATES.length > limit && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={onSeeAllTemplates}
              className="bg-black text-white font-heading font-bold text-lg uppercase rounded-xl px-8 py-3 border-4 border-transparent hover:bg-gray-900 transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:shadow-none"
            >
              See All Templates
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
