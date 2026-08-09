import React from 'react';

export const AboutPage: React.FC = () => {
  React.useEffect(() => {
    document.title = "About Us | OnlineWishes";
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-lovely-yellow">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-heading mb-6 text-black tracking-tight">Our Story</h1>
          <p className="text-xl font-body text-gray-800">Creating beautiful, personalized digital moments to celebrate your special ones.</p>
        </div>

        <div className="bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-xl">
          <h2 className="text-3xl font-heading mb-4">The OnlineWishes Mission</h2>
          <p className="text-lg font-body mb-4">
            At OnlineWishes, we believe that every relationship is unique and deserves to be celebrated in a special way. We started with a simple idea: to make digital greetings as thoughtful and personalized as physical ones, but with the added magic of music, memories, and modern design.
          </p>
          <p className="text-lg font-body">
            Our mission is to help you create unforgettable surprise memory websites that make your loved ones feel truly cherished.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-lovely-pink border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-xl">
            <h2 className="text-2xl font-heading mb-4">Our Values</h2>
            <ul className="list-disc list-inside font-body text-lg space-y-2">
              <li>Joy in every pixel</li>
              <li>Meaningful personalization</li>
              <li>Simplicity and ease of use</li>
              <li>Celebrating all connections</li>
            </ul>
          </div>
          <div className="bg-lovely-mint border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] p-8 rounded-xl">
            <h2 className="text-2xl font-heading mb-4">Why OnlineWishes?</h2>
            <p className="font-body text-lg">
              Because we make it incredibly easy to build a premium, custom surprise in just a few clicks. No coding, no hassle—just pure joy delivered instantly via a simple link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
