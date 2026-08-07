import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';

export function ContactAndNewsletter() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

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
      setContactSubmitted(false);
    }, 3000);
  };

  return (
    <section className="py-12 md:py-20 bg-lovely-mint border-t-8 border-black transition-colors relative overflow-hidden">
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-16 relative z-10 max-w-6xl mx-auto">
        
        {/* NEWSLETTER BANNER */}
        <div className="relative overflow-hidden rounded-[2rem] bg-lovely-pink border-4 border-black p-8 sm:p-12 text-white shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h3 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-black uppercase">
              Subscribe For Exclusive Templates
            </h3>
            
            <p className="font-body text-white font-bold text-sm sm:text-base">
              Join 15,000+ creators getting new secret surprise box templates and discount promo codes every month.
            </p>

            {newsletterSubmitted ? (
              <div className="p-4 bg-white rounded-2xl flex items-center space-x-3 text-sm font-bold border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-black mt-4">
                <CheckCircle2 className="w-8 h-8 text-lovely-mint" />
                <div>
                  <p className="font-heading text-lg">You're Subscribed!</p>
                  <p className="font-body text-lovely-neon">PROMO CODE: WISHES10</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 mt-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full pl-12 pr-4 py-3 bg-white text-black border-4 border-black rounded-xl font-bold font-body focus:outline-none focus:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-lovely-yellow hover:bg-[#E5B833] text-black font-heading font-black text-lg uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    <span>Claim Discount</span>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-sm font-bold text-lovely-yellow flex items-center space-x-1 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{newsletterError}</span>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* CONTACT FORM */}
        <div id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-heading text-4xl sm:text-5xl font-black text-black uppercase">
              We're Here <br/><span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">To Help!</span>
            </h3>

            <p className="font-body text-base font-bold text-black leading-relaxed">
              Want a custom domain setup, bulk corporate gift websites, or assistance with uploading your 21 memories? Send us a message and our support team will reply within 2 hours.
            </p>

            <div className="space-y-3 font-body font-bold text-black bg-white border-4 border-black p-6 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <p className="flex items-center gap-2"><span>📍</span> OnlineWishes Inc.</p>
              <p className="flex items-center gap-2"><span>✉️</span> codelearnpoint@gmail.com</p>
              <p className="flex items-center gap-2">
                <span>📸</span> 
                <a href="https://instagram.com/onlinewishes.in" target="_blank" rel="noopener noreferrer" className="hover:text-lovely-pink transition-colors">
                  @onlinewishes.in
                </a>
              </p>
              <p className="flex items-center gap-2"><span>⚡</span> Avg reply: &lt; 2 hours</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-lovely-lavender p-6 sm:p-8 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            {contactSubmitted ? (
              <div className="text-center py-12 space-y-4 bg-white border-4 border-black rounded-2xl">
                <CheckCircle2 className="w-16 h-16 text-lovely-mint mx-auto animate-bounce" />
                <h4 className="font-heading text-3xl font-black text-black uppercase">Message Sent!</h4>
                <p className="font-body font-bold text-gray-700 px-4">
                  Thank you, {contactName}. We have received your query and sent a confirmation email to {contactEmail}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-lg font-black text-black mb-1" htmlFor="contact-name">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-white text-black border-4 border-black rounded-xl font-bold font-body focus:outline-none focus:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  <div>
                    <label className="block font-heading text-lg font-black text-black mb-1" htmlFor="contact-email">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-white text-black border-4 border-black rounded-xl font-bold font-body focus:outline-none focus:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-heading text-lg font-black text-black mb-1" htmlFor="contact-msg">
                    How can we help you? *
                  </label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us about your surprise website idea..."
                    className="w-full p-4 bg-white text-black border-4 border-black rounded-xl font-bold font-body focus:outline-none focus:ring-0 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-lovely-neon hover:bg-[#E6005C] text-white font-heading font-black text-xl uppercase rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-2 mt-4"
                >
                  <Send className="w-5 h-5" />
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
