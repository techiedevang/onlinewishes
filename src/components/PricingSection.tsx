import React, { useState } from 'react';
import { TEMPLATES } from '../data/templates';
import { Template } from '../types';
import { Check, Sparkles, ShieldCheck, Lock, CreditCard, ArrowRight, Zap, Bot, Star } from 'lucide-react';

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
    <section id="pricing" className="py-16 md:py-24 bg-lovely-lavender transition-colors relative overflow-hidden border-t-8 border-black">
      
      {/* Background decorations */}
      <div className="absolute top-20 left-10">
        <svg width="45" height="45" viewBox="0 0 100 100">
          <path d="M50 5 L61 35 L95 35 L68 55 L79 85 L50 65 L21 85 L32 55 L5 35 L39 35 Z" fill="#F2C94C" stroke="#000" strokeWidth="4"></path>
        </svg>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-12 max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-black uppercase tracking-tight">
            Transparent <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Pricing</span>
          </h2>
          <p className="font-body font-bold text-base sm:text-xl text-black">
            Choose any template design below. No monthly subscriptions, no photo limits!
          </p>
        </div>

        {/* CUSTOM AI IDEA BANNER CARD */}
        <div className="relative overflow-hidden bg-lovely-neon text-white rounded-[2rem] p-8 sm:p-10 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-8 transform rotate-1">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white text-black font-heading font-black px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase text-sm">
              <Bot className="w-5 h-5 text-lovely-pink" />
              <span>Bespoke AI Architect</span>
            </div>
            <h3 className="font-heading text-3xl sm:text-4xl font-black uppercase drop-shadow-md">
              Want a Custom Design Built From Scratch?
            </h3>
            <p className="font-body font-bold text-sm sm:text-base leading-relaxed text-white/90">
              Share your exact idea or vision with our AI Architect. We will generate a bespoke custom concept, personalized color scheme, custom soundboard, and interactive features built just for you.
            </p>
          </div>

          <div className="flex-shrink-0 text-center md:text-right w-full md:w-auto bg-white border-4 border-black p-6 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-2">
            <div className="font-heading text-4xl font-black text-black mb-1">Rs. 79</div>
            <div className="font-body font-bold text-gray-500 text-xs mb-4 uppercase tracking-wider">Flat Setup Fee</div>
            <button
              onClick={onOpenCustomAiModal}
              className="w-full md:w-auto px-6 py-4 bg-lovely-yellow hover:bg-[#E5B833] text-black font-heading font-black text-sm uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Describe My Idea</span>
            </button>
          </div>
        </div>

        {/* Template Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 overflow-x-auto pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-heading text-sm font-black uppercase transition-all border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
                selectedCategory === cat.id
                  ? 'bg-lovely-pink text-white translate-y-1 shadow-none'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template, idx) => (
            <div
              key={template.id}
              className="bg-white rounded-[2rem] p-6 sm:p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading text-xs font-black uppercase text-black bg-lovely-yellow px-3 py-1.5 rounded-lg border-2 border-black">
                    {template.category}
                  </span>
                  <div className="flex items-center space-x-1 bg-black text-white px-2.5 py-1 rounded-lg border-2 border-black">
                    <Star className="w-3.5 h-3.5 fill-lovely-yellow text-lovely-yellow" />
                    <span className="font-body font-bold text-xs">{template.rating}</span>
                  </div>
                </div>

                <h3 className="font-heading text-2xl font-black text-black uppercase line-clamp-1 mb-2">
                  {template.title}
                </h3>
                
                <p className="font-body font-bold text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>

                {/* Price Display */}
                <div className="mt-6 mb-6 flex items-baseline">
                  <span className="font-heading text-4xl font-black text-lovely-neon">
                    Rs. {template.price}
                  </span>
                  <span className="font-body font-bold text-sm text-gray-500 ml-2">
                    / flat fee
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-6 border-t-4 border-black/10">
                  <div className="flex items-start space-x-3 font-body font-bold text-sm text-black">
                    <Check className="w-5 h-5 text-lovely-pink flex-shrink-0" />
                    <span>Flexible & Unlimited Photos Capacity</span>
                  </div>

                  {template.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-3 font-body font-bold text-sm text-gray-700">
                      <Check className="w-5 h-5 text-lovely-mint flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-auto">
                <button
                  onClick={() => onSelectTemplateToBuild(template)}
                  className="w-full py-4 px-4 bg-lovely-neon hover:bg-[#E6005C] text-white font-heading font-black text-lg uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-2"
                >
                  <span>Select Plan</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Payment Security Guarantees */}
        <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-around gap-6 font-body font-bold text-sm text-black">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-lovely-pink" />
            <span>256-Bit SSL Checkout</span>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-lovely-neon" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-lovely-mint" />
            <span>100% Satisfaction Guarantee</span>
          </div>
        </div>

      </div>
    </section>
  );
}
