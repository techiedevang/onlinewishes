import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

export function ContactAndNewsletter() {
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Contact state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterSubmitted(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 2000);
  };

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-16">
        
        {/* 1. NEWSLETTER BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 p-8 sm:p-12 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get 10% Off Your Custom Website</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Subscribe For Exclusive Templates & Gift Ideas
            </h3>
            
            <p className="text-rose-100 text-xs sm:text-sm">
              Join 15,000+ creators getting new secret surprise box templates and discount promo codes every month.
            </p>

            {newsletterSubmitted ? (
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl flex items-center space-x-3 text-sm font-bold">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                <div>
                  <p>You're Subscribed! Here is your code:</p>
                  <p className="text-yellow-300 font-mono text-base">PROMO CODE: WISHES10</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      aria-label="Email address for newsletter"
                      className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300 shadow"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-colors shadow flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    <span>Claim Discount</span>
                    <Send className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-xs text-yellow-200 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{newsletterError}</span>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* 2. CONTACT FORM */}
        <div id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>We're Here To Help</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Have Questions or Special Custom Requests?
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Want a custom domain setup, bulk corporate gift websites, or assistance with uploading your 21 memories? Send us a message and our support team will reply within 2 hours.
            </p>

            <div className="pt-2 space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <p>📍 OnlineWishes Inc. - Global Digital Platform</p>
              <p>✉️ codelearnpoint@gmail.com</p>
              <p>⚡ Average response time: &lt; 2 hours</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/80 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {contactSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thank you, {contactName}. We have received your query and sent a confirmation email to {contactEmail}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="contact-name">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="contact-email">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="contact-msg">
                    How can we help you? *
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your surprise website idea or question..."
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
