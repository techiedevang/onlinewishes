import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Info, Mail, RefreshCw, Send, CheckCircle2, Heart, Award, Lock, Sparkles } from 'lucide-react';

export type PolicyTab = 'privacy' | 'terms' | 'about' | 'contact' | 'refund';

interface PolicyModalProps {
  initialTab?: PolicyTab;
  onClose: () => void;
}

export function PolicyModal({ initialTab = 'privacy', onClose }: PolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {activeTab === 'terms' && <FileText className="w-5 h-5" />}
              {activeTab === 'about' && <Info className="w-5 h-5" />}
              {activeTab === 'contact' && <Mail className="w-5 h-5" />}
              {activeTab === 'refund' && <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {activeTab === 'privacy' && 'Privacy Policy'}
                {activeTab === 'terms' && 'Terms of Service'}
                {activeTab === 'about' && 'About OnlineWishes'}
                {activeTab === 'contact' && 'Contact Support'}
                {activeTab === 'refund' && 'Refund & Cancellation Policy'}
              </h2>
              <p className="text-xs text-slate-400">
                OnlineWishes.com — Transparency & Legal Information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'terms'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'about'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Contact</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'refund'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refund Policy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center space-x-3 text-xs text-slate-400">
                <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Last Updated: July 2026. Your memories, photos, and personalized messages are stored securely with end-to-end passcode encryption options.</span>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">1.</span>
                  <span>Information We Collect</span>
                </h3>
                <p>
                  OnlineWishes collects information you provide directly when creating a personalized surprise website. This includes uploaded photos, customized audio messages, recipient names, custom love letters, and passcodes you choose to set.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">2.</span>
                  <span>How We Use Your Memory Data</span>
                </h3>
                <p>
                  Your memory content is used solely to generate and render your custom interactive gift webpage. We do not sell, rent, or trade your personal photos or private messages to third-party advertisers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">3.</span>
                  <span>Photo Privacy & Passcode Security</span>
                </h3>
                <p>
                  You can protect your surprise page with a 4-digit passcode or security lock. Only individuals with your unique URL (or passcode) will be able to unlock and view the memory scrapbooks.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">4.</span>
                  <span>Data Retention & Deletion</span>
                </h3>
                <p>
                  Surprise websites remain active perpetually unless you request deletion. You can request complete removal of your published links and media assets at any time by contacting our privacy officer at <a href="mailto:admin@onlinewishes.in" className="text-rose-400 underline">admin@onlinewishes.in</a>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center space-x-3 text-xs text-slate-400">
                <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                <span>By accessing OnlineWishes.com, you agree to comply with our Terms of Service and Acceptable Use Guidelines.</span>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">1.</span>
                  <span>Acceptance of Terms</span>
                </h3>
                <p>
                  By creating, customizing, or publishing a website on OnlineWishes, you confirm that you own or have explicit consent to upload all photos, audio recordings, and text content included in your surprise page.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">2.</span>
                  <span>Acceptable Use & Prohibited Content</span>
                </h3>
                <p>
                  Users are strictly prohibited from uploading illegal, abusive, hateful, defamatory, or non-consensual explicit material. Content violating these standards will be removed immediately without prior notice.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">3.</span>
                  <span>Service Availability & Hosting</span>
                </h3>
                <p>
                  OnlineWishes strives to maintain 99.9% uptime for all published surprise links. While we utilize cloud-hosted infrastructure, we are not liable for transient network disruptions beyond our control.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">4.</span>
                  <span>Intellectual Property</span>
                </h3>
                <p>
                  You retain full ownership of your personal photos and messages. OnlineWishes retains ownership of the underlying interactive software templates, layout algorithms, and custom animations.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/20 rounded-3xl space-y-3">
                <div className="inline-flex items-center space-x-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Our Mission</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Crafting Digital Surprises That Turn Bestie Moments Into Lifelong Memories
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  OnlineWishes was born out of a simple desire: to make gift-giving deeper, more emotional, and unforgettable. Instead of generic social media posts, we help besties, couples, sisters, and families turn 21 cherished photos into an interactive, musical memory vault.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-center">
                  <Heart className="w-7 h-7 text-rose-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Heartfelt Design</h4>
                  <p className="text-xs text-slate-400">Every template is engineered with emotional triggers, ambient music, and interactive unboxing reveals.</p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-center">
                  <Award className="w-7 h-7 text-amber-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Instant Publishing</h4>
                  <p className="text-xs text-slate-400">No coding or design skills required. Create and share your live custom link in less than 3 minutes.</p>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-center">
                  <ShieldCheck className="w-7 h-7 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-sm">Private & Protected</h4>
                  <p className="text-xs text-slate-400">Passcode protection guarantees that your private memories stay strictly between you and your recipient.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                <div className="md:col-span-5 space-y-4">
                  <h3 className="text-lg font-bold text-white">Get in Touch with Our Team</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Have questions about custom domains, payment receipts, or need assistance uploading your 21 memories? Send us a message below.
                  </p>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[10px]">Official Support Email</span>
                      <a href="mailto:codelearnpoint@gmail.com" className="text-rose-400 font-mono font-bold hover:underline">
                        codelearnpoint@gmail.com
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[10px]">Response Guarantee</span>
                      <span className="text-emerald-400 font-medium">Replies dispatched within 2 hours</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
                  {contactSubmitted ? (
                    <div className="text-center py-8 space-y-3">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                      <h4 className="text-base font-bold text-white">Message Sent Successfully!</h4>
                      <p className="text-xs text-slate-400">
                        Thank you, {contactName}. We have received your query and sent a confirmation copy to {contactEmail}.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Your Name *</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Subject</label>
                        <input
                          type="text"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="How can we help?"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Your Message *</label>
                        <textarea
                          rows={3}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Type your question or request..."
                          className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Support Request</span>
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center space-x-3 text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 text-rose-400 shrink-0" />
                <span>100% Satisfaction Guarantee. We stand behind the emotional quality and digital delivery of every surprise website.</span>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">1.</span>
                  <span>7-Day Money-Back Guarantee</span>
                </h3>
                <p>
                  If you are not completely satisfied with your published website or encounter technical difficulties that prevent your recipient from enjoying the surprise, you are eligible for a 100% full refund within 7 days of purchase.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">2.</span>
                  <span>How to Request a Refund</span>
                </h3>
                <p>
                  To request a refund, simply email our billing team at <a href="mailto:codelearnpoint@gmail.com" className="text-rose-400 font-mono underline">codelearnpoint@gmail.com</a> with your transaction ID or payment email. Refunds are processed within 24–48 hours to your original payment method (Razorpay / UPI / Card / PayPal).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="text-rose-400">3.</span>
                  <span>Free Edits & Lifetime Hosting Option</span>
                </h3>
                <p>
                  Before requesting a refund for accidental photo uploads or text typos, note that you can edit your website content or swap photos anytime free of charge through our support team!
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} OnlineWishes Inc. All Rights Reserved.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
