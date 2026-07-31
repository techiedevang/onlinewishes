import React, { useState } from 'react';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';
import { Check, Sparkles, ShieldCheck, Lock, CreditCard, ArrowRight, Zap, Bot, Star, Layers } from 'lucide-react';

interface PricingSectionProps {
  onSelectTemplateToBuild: (template: Template) => void;
  onOpenCustomAiModal: () => void;
}

export function PricingSection({
  onSelectTemplateToBuild,
  onOpenCustomAiModal,
}: PricingSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'bestie', label: '👭 Bestie' },
    { id: 'girlfriend', label: '❤️ Girlfriend / Partner' },
    { id: 'sister', label: '🌸 Sister' },
    { id: 'birthday', label: '🎉 Birthday' },
  ];

  const filteredTemplates = TEMPLATES.filter((tpl) =>
    selectedCategory === 'all' ? true : tpl.category === selectedCategory
  );

  return (
    <section id="pricing" className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900/80 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Template-Based Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pay Per Template. Unlimited Photos & Lifetime Hosting.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Choose any template design below with transparent flat pricing. No monthly subscriptions, no photo limits.
          </p>
        </div>

        {/* CUSTOM AI IDEA BANNER CARD */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-rose-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-rose-400" />
              <span>Bespoke AI Custom Request</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              Want a Completely Custom Design Built From Scratch?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Share your exact idea or vision with our AI Architect. We will generate a bespoke custom concept, personalized color scheme, custom soundboard, and interactive features built just for you (Flat Price: Rs. 79).
            </p>
          </div>

          <div className="flex-shrink-0 text-center md:text-right w-full md:w-auto">
            <div className="text-2xl font-black text-emerald-400 mb-2">Rs. 79</div>
            <button
              onClick={onOpenCustomAiModal}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Describe My Idea to AI</span>
            </button>
          </div>
        </div>

        {/* Template Category Filters */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase text-rose-500 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                    {template.category}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{template.rating}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {template.title}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {template.description}
                </p>

                {/* Price Display */}
                <div className="mt-5 mb-5 flex items-baseline">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    Rs. {template.price}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-2">
                    / one-time flat fee
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Flexible & Unlimited Photos Capacity</span>
                  </div>

                  {template.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => onSelectTemplateToBuild(template)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2"
                >
                  <span>Customize & Buy (Rs. {template.price})</span>
                  <ArrowRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Payment Security Guarantees */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-rose-500" />
            <span>Accepts Visa, Mastercard, Apple Pay</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>100% Satisfaction Guarantee</span>
          </div>
        </div>

      </div>
    </section>
  );
}
