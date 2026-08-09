import React from 'react';

export const FaqPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "FAQ | OnlineWishes";
  }, []);

  const faqs = [
    { q: "How does it work?", a: "Choose a template, personalize it with photos, a name, and a custom message, then get a unique link to share your surprise memory website." },
    { q: "What is a surprise memory website?", a: "It's a digital greeting card in the form of a mini-website, personalized with your memories, photos, and music." },
    { q: "Are there any pricing details I should know?", a: "OnlineWishes offers various affordable plans depending on the features and templates you choose. Many basic templates are completely free!" },
    { q: "How do I share the link?", a: "Once published, you will receive a unique URL. Simply copy and paste it into WhatsApp, Instagram DM, email, or any messenger." },
    { q: "Can I add my own music?", a: "Yes! Premium templates allow you to add your favorite Spotify or YouTube tracks to play in the background." },
    { q: "What are the photo requirements?", a: "We recommend high-quality JPG or PNG files. Most templates support standard aspect ratios, and our editor helps you crop them perfectly." },
    { q: "Is there privacy or passcode protection?", a: "Absolutely. You can choose to add a passcode so only the person with the code can view your OnlineWishes creation." },
    { q: "Can I edit the website after publishing?", a: "Yes, you can edit your website at any time from your dashboard, and the changes will reflect immediately on the same link." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards, UPI, and popular digital wallets." },
    { q: "What is your refund policy?", a: "If you are not satisfied with your premium template, please contact us within 24 hours of purchase for a full refund." },
    { q: "How long does it take to create a wish?", a: "It takes less than 5 minutes! Our user-friendly editor makes the process incredibly fast and fun." },
    { q: "What kind of templates are available?", a: "We have templates for birthdays, anniversaries, apologies, friendships, and general 'just because' moments." },
    { q: "Can someone see who made it?", a: "Only if you include your name in the personalized message! Otherwise, it can be completely anonymous." },
    { q: "Is the website mobile compatible?", a: "Yes, all OnlineWishes templates are fully responsive and look gorgeous on any device, especially mobile phones." },
    { q: "How many photos can I add?", a: "Depending on the template, you can add anywhere from 1 to 20 photos." }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-lovely-lavender">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading mb-10 text-center text-black">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-6 rounded-xl">
              <h3 className="text-xl font-heading mb-2">{faq.q}</h3>
              <p className="font-body text-gray-700">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
