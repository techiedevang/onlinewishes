import React from 'react';

export const WhyOnlineWishesPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "Why Choose Us | OnlineWishes";
  }, []);

  const reasons = [
    { title: "Unique Personalization", desc: "Every website is tailored to your special someone with their name, photos, and your words.", color: "bg-lovely-yellow" },
    { title: "Beautiful Templates", desc: "Our designs are crafted with a fun, bubblegum retro aesthetic that pops and delights.", color: "bg-lovely-pink" },
    { title: "Easy to Use", desc: "No coding or design skills needed. Create a stunning website in under 5 minutes.", color: "bg-lovely-mint" },
    { title: "Instant Delivery", desc: "Your website is live immediately. Just copy the link and share it anywhere.", color: "bg-lovely-lavender" },
    { title: "Passcode Protection", desc: "Keep your memories safe and private with optional passcode protection.", color: "bg-lovely-plum" },
    { title: "Music Integration", desc: "Set the mood by adding background music to your surprise memory website.", color: "bg-lovely-neon" },
    { title: "Group Wishes", desc: "Easily gather messages from friends and family to create a massive group surprise.", color: "bg-white" },
    { title: "Mobile Optimized", desc: "Looks perfect on all screens, especially optimized for the mobile viewing experience.", color: "bg-lovely-yellow" },
    { title: "Affordable Pricing", desc: "Premium features at a price that makes spreading joy accessible to everyone.", color: "bg-lovely-pink" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-lovely-mint">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-heading text-center mb-12 text-black">Why Choose OnlineWishes?</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, idx) => (
            <div key={idx} className={`${r.color} border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 rounded-xl`}>
              <h3 className="text-xl font-heading mb-3">{r.title}</h3>
              <p className="font-body text-black font-medium">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
