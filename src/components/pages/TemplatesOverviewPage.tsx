import React from 'react';

export const TemplatesOverviewPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "Templates | OnlineWishes";
  }, []);

  const categories = [
    { title: "Valentine Templates", desc: "Express your love with romantic, sweet, and cute surprise websites.", color: "bg-lovely-pink", count: 12 },
    { title: "Birthday Templates", desc: "Celebrate their special day with confetti, music, and joyful memories.", color: "bg-lovely-yellow", count: 24 },
    { title: "Friendship Templates", desc: "Because friends deserve to know how awesome they are.", color: "bg-lovely-mint", count: 8 },
    { title: "Sorry Templates", desc: "Make amends with a heartfelt, personalized apology website.", color: "bg-lovely-lavender", count: 5 }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-lovely-neon">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-heading mb-4 text-black">Browse Templates</h1>
          <p className="text-xl font-body font-medium">Find the perfect design for your OnlineWishes surprise.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className={`${cat.color} border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 rounded-2xl hover:-translate-y-2 transition-transform cursor-pointer`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-heading">{cat.title}</h2>
                <span className="bg-white border-2 border-black px-3 py-1 rounded-full font-heading text-sm">
                  {cat.count} Designs
                </span>
              </div>
              <p className="font-body text-lg font-medium mb-6 text-gray-900">{cat.desc}</p>
              <button className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-6 py-2 rounded-xl font-heading hover:bg-gray-100 transition-colors">
                Explore Category &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
