import React from 'react';

export const ContactPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "Contact Us | OnlineWishes";
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-lovely-plum">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-heading text-center mb-12 text-black">Get in Touch</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-xl">
            <h2 className="text-3xl font-heading mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block font-heading mb-2">Name</label>
                <input type="text" className="w-full border-4 border-black p-3 rounded-lg font-body focus:outline-none focus:bg-lovely-yellow transition-colors" placeholder="Your Name" />
              </div>
              <div>
                <label className="block font-heading mb-2">Email</label>
                <input type="email" className="w-full border-4 border-black p-3 rounded-lg font-body focus:outline-none focus:bg-lovely-mint transition-colors" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block font-heading mb-2">Message</label>
                <textarea className="w-full border-4 border-black p-3 rounded-lg font-body focus:outline-none focus:bg-lovely-pink transition-colors h-32" placeholder="How can we help?"></textarea>
              </div>
              <button className="w-full bg-lovely-neon border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-4 rounded-xl font-heading text-xl hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all">
                Send Message
              </button>
            </form>
          </div>
          
          <div className="space-y-8">
            <div className="bg-lovely-yellow border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-xl">
              <h2 className="text-2xl font-heading mb-4">Contact Info</h2>
              <p className="font-body text-lg mb-2"><strong>Email:</strong> support@onlinewishes.in</p>
              <p className="font-body text-lg">
                <strong>Instagram:</strong> <a href="#" className="underline hover:text-pink-600">@onlinewishes</a>
              </p>
            </div>
            
            <div className="bg-lovely-mint border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-xl">
              <h2 className="text-2xl font-heading mb-4">Quick Links</h2>
              <ul className="space-y-2 font-body text-lg underline">
                <li><a href="/faq">Frequently Asked Questions</a></li>
                <li><a href="/how-it-works">How It Works</a></li>
                <li><a href="/templates">Browse Templates</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
