import React, { useState } from 'react';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';
import { Star, Eye, Sparkles, Heart, Search, Filter, ArrowRight, Layers, Check, MessageSquare, Bot, Maximize2 } from 'lucide-react';

interface TemplateGalleryProps {
  onPreviewTemplate: (template: Template) => void;
  onSelectTemplateToBuild: (template: Template) => void;
  onOpenReviewsModal: (template: Template) => void;
  onOpenCustomAiModal?: () => void;
}

export function TemplateGallery({
  onPreviewTemplate,
  onSelectTemplateToBuild,
  onOpenReviewsModal,
  onOpenCustomAiModal,
}: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'bestie', label: '👭 Bestie' },
    { id: 'girlfriend', label: '❤️ GF / BF' },
    { id: 'sister', label: '🌸 Sister & Family' },
    { id: 'birthday', label: '🎉 Birthday' },
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="templates" className="py-12 md:py-20 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Template Designs & Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Select a Gift Template & Customize It in Minutes
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Every template is 100% customizable with as many photos as you want, personalized music, secret passcodes, and custom poems.
          </p>
        </div>

        {/* AI Custom Request Banner */}
        {onOpenCustomAiModal && (
          <div className="bg-gradient-to-r from-purple-900 via-rose-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/30 flex items-center justify-center text-rose-300 flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold flex items-center space-x-2">
                  <span>Have a Specific Custom Idea in Mind?</span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    AI Architect
                  </span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Describe your dream website concept and our AI will build a custom blueprint (Custom Website: Rs. 300).
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCustomAiModal}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request Custom AI Design</span>
            </button>
          </div>
        )}

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              
              {/* Image Preview Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={template.thumbnail}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800';
                  }}
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                  {template.badge}
                </div>

                {/* Top-Right Expand Preview Button */}
                <button
                  type="button"
                  onClick={() => onPreviewTemplate(template)}
                  className="absolute top-3 right-3 bg-slate-900/80 hover:bg-rose-600 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-md transition-all flex items-center space-x-1 z-10"
                  title="Expand Full-Screen Demo Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand Preview</span>
                </button>

                {/* Price Pill */}
                <div className="absolute bottom-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                  Rs. {template.price}
                </div>

                {/* Photo Capacity Pill */}
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  Flexible Photos
                </div>

                {/* Hover Preview Overlay Trigger */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <button
                    onClick={() => onPreviewTemplate(template)}
                    className="px-4 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg hover:bg-rose-50 flex items-center space-x-2 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                  >
                    <Maximize2 className="w-4 h-4 text-rose-500" />
                    <span>Expand Full-Screen Preview</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      {template.category.toUpperCase()}
                    </span>

                    {/* Review Trigger Button */}
                    <button
                      onClick={() => onOpenReviewsModal(template)}
                      className="flex items-center space-x-1 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-bold hover:underline transition-all"
                      title="Read and write template reviews"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{template.rating}</span>
                      <span className="text-slate-400 font-normal">({template.reviewsCount || 120})</span>
                      <MessageSquare className="w-3 h-3 ml-0.5 text-slate-400" />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                    {template.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Features Bullet List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  {template.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onPreviewTemplate(template)}
                    className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 hover:text-rose-600 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1"
                    title="See a full-screen interactive demo"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Expand Preview</span>
                  </button>

                  <button
                    onClick={() => onSelectTemplateToBuild(template)}
                    className="flex-1 py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center space-x-1"
                  >
                    <span>Customize & Buy (Rs. {template.price})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
