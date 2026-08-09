import React from 'react';

export const HowItWorksPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "How It Works | OnlineWishes";
  }, []);

  const steps = [
    { step: 1, title: "Choose a Template", desc: "Browse our collection of beautiful templates for birthdays, love, friendships, and more.", emoji: "🎨", color: "bg-lovely-yellow" },
    { step: 2, title: "Customize with Love", desc: "Upload your favorite photos, add their name, and pick the perfect background music.", emoji: "✨", color: "bg-lovely-pink" },
    { step: 3, title: "Publish & Get Link", desc: "Hit publish and instantly receive a unique link to your custom surprise memory website.", emoji: "🔗", color: "bg-lovely-mint" },
    { step: 4, title: "Share the Surprise", desc: "Send the link via WhatsApp or any messenger and watch them smile!", emoji: "🎉", color: "bg-lovely-violet" }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-lovely-neon">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-heading text-center mb-12 text-black">How OnlineWishes Works</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => (
            <div key={idx} className={`${s.color} border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-2xl flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform`}>
              <div className="text-5xl mb-4 bg-white border-4 border-black rounded-full w-20 h-20 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {s.emoji}
              </div>
              <h2 className="text-2xl font-heading mb-3">Step {s.step}</h2>
              <h3 className="text-xl font-heading mb-3">{s.title}</h3>
              <p className="font-body text-black font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
