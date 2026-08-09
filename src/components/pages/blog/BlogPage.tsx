import React from 'react';
import { BLOG_POSTS } from './blogRegistry';

interface BlogPageProps {
  onNavigate?: (slug: string) => void;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const categoryColors: Record<string, string> = {
    valentine: 'bg-lovely-neon text-white',
    friendship: 'bg-lovely-mint text-black',
    birthday: 'bg-lovely-yellow text-black',
    relationship: 'bg-lovely-pink text-white',
    anniversary: 'bg-lovely-violet text-white',
    apology: 'bg-lovely-lavender text-black',
    digital: 'bg-black text-white',
    indian: 'bg-lovely-yellow text-black',
    wedding: 'bg-lovely-mint text-black',
    girlfriend: 'bg-lovely-neon text-white',
    couples: 'bg-lovely-pink text-white',
    default: 'bg-black text-white',
  };

  const handleClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(slug);
    } else {
      window.location.href = `/blog/${slug}`;
    }
  };

  return (
    <div className="min-h-screen bg-lovely-yellow pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-lovely-neon text-white font-heading text-sm uppercase px-4 py-1.5 rounded-full border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] mb-4">
            ✍️ OnlineWishes Blog
          </div>
          <h1 className="font-heading text-5xl md:text-6xl text-black font-black drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
            Tips, Ideas & Inspiration
          </h1>
          <p className="font-body font-bold text-gray-700 text-lg max-w-2xl mx-auto">
            Love letters, surprise ideas, occasion guides and more — everything you need to make your person feel truly special.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post) => {
            const colorClass = categoryColors[post.category] || categoryColors.default;
            return (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                onClick={(e) => handleClick(e, post.slug)}
                className="block bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all rounded-2xl overflow-hidden group"
              >
                <div className={`${colorClass} px-4 py-3 border-b-4 border-black flex items-center justify-between`}>
                  <span className="font-heading text-sm uppercase font-black">
                    {post.category}
                  </span>
                  <span className="font-body text-xs font-bold opacity-80">
                    {post.date}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="font-heading text-xl font-black mb-3 leading-tight text-black group-hover:text-lovely-neon transition-colors">
                    {post.title}
                  </h2>
                  <p className="font-body text-gray-600 font-bold text-sm mb-5 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="font-heading text-sm uppercase font-black text-lovely-neon inline-flex items-center gap-1">
                    Read Article
                    <span className="group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-lovely-neon border-4 border-black rounded-3xl p-8 text-center shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <h2 className="font-heading text-3xl text-white font-black mb-3">Ready to Create Something Beautiful?</h2>
          <p className="font-body text-white/90 font-bold mb-6">Turn your feelings into a stunning personalized website in minutes.</p>
          <button
            onClick={() => { window.history.pushState(null, '', '/templates'); window.dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); }}
            className="bg-white text-black font-heading font-black uppercase px-8 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            Browse Templates →
          </button>
        </div>
      </div>
    </div>
  );
}
