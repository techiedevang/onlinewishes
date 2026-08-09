import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const SITE_URL = 'https://onlinewishes.in';

const mainRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/templates', priority: '0.9', changefreq: 'weekly' },
  { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { url: '/custom_AI', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.6', changefreq: 'monthly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/how-it-works', priority: '0.6', changefreq: 'monthly' },
  { url: '/why-onlinewishes', priority: '0.6', changefreq: 'monthly' },
  { url: '/templates-overview', priority: '0.7', changefreq: 'weekly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
  { url: '/refund-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/about-us', priority: '0.7', changefreq: 'monthly' }
];

const templates = [
  'sorry-heartfelt-apology',
  'friendship-day-greet',
  'box21-surprise',
  'romantic-love-story',
  'bestie-chaos-polaroid',
  'sisterhood-gratitude-tree',
  'birthday-confetti-party',
  'retro-90s-arcade',
  'celestial-galaxy',
  'minimalist-editorial',
  'vintage-parchment'
];

// All blog post slugs
const blogSlugs = [
  // Valentine & Love
  'valentines-day-2026-india-romantic-ideas',
  'valentine-week-2026-india-calendar',
  'rose-day-2026-meaning-color-guide-ideas',
  'propose-day-2026-creative-ways-to-ask',
  'chocolate-day-2026-romantic-ideas-india',
  'teddy-day-cute-messages-long-distance',
  'promise-day-heartfelt-promises-couples',
  'hug-day-virtual-hugs-long-distance-india',
  'kiss-day-cute-messages-couples',
  'valentines-week-history-india-how-it-evolved',
  // Post Valentine / Anti-Valentine
  'slap-day-meaning-healing-after-breakup',
  'kick-day-letting-go-toxic-relationships',
  'perfume-day-self-love-rituals-india',
  'flirt-day-rizz-quest-ideas',
  'confession-day-when-and-how-to-tell-truth',
  'missing-day-grief-and-letting-go',
  'breakup-day-closure-and-fresh-start',
  'gen-z-anti-valentine-tradition-india-explained',
  // Friendship
  'friendship-day-2026-wishes-messages-whatsapp',
  'friendship-day-gift-ideas-2026-india',
  'friendship-day-2026-quotes-dosti-shayari-hindi-english',
  'friendship-day-2026-instagram-captions-best-friend',
  'am-i-in-love-with-my-best-friend-signs',
  'how-to-confess-to-crush-without-ruining-friendship',
  'best-friend-moving-away-farewell-messages',
  'friendship-day-2026-date-history-why-august-first-sunday',
  'friendship-day-2026-celebrate-online-long-distance',
  'friendship-day-wishes-for-girl-best-friend',
  'friendship-day-message-for-male-best-friend',
  'friendship-day-paragraphs-for-best-friend',
  'deep-questions-to-ask-your-best-friend',
  'cute-nicknames-for-best-friends',
  'love-letter-to-best-friend-examples',
  'long-distance-friendship-messages-how-to-stay-close',
  'message-to-reconnect-with-old-friend',
  'thank-you-message-for-friend-who-supported-you',
  'signs-your-best-friend-is-in-love-with-you',
  'can-boys-and-girls-be-just-friends-india',
  'friendzone-meaning-signs-what-to-do',
  'one-sided-love-for-a-friend-how-to-cope',
  'more-than-friends-less-than-lovers-what-to-do',
  'should-i-confess-or-stay-friends',
  'situationship-what-to-send-when-its-not-official',
  'friends-to-couples-transition-test-the-water',
  'how-to-tell-your-best-friend-you-love-them',
  'first-i-love-you-text-vs-page-ideas',
  'friendship-band-digital-alternative-2026',
  'friendship-anniversary-friendversary-ideas',
  'friendship-day-india-2026-50-appreciation-lines',
  'what-to-write-in-friendship-day-card',
  // Birthday
  'birthday-wishes-for-best-friend-50-ideas',
  'birthday-wishes-for-girlfriend-boyfriend',
  'birthday-wishes-for-mom-from-daughter-personalized',
  'birthday-wishes-for-husband-wife-personalized',
  'birthday-wishes-for-dad-from-son-emotional',
  'birthday-wishes-for-long-distance-partner-india',
  'surprise-birthday-page-ideas-pair-with-physical-gift',
  '50th-birthday-milestone-message-ideas',
  '30th-birthday-milestone-message-ideas',
  // Relationship & Love
  'how-to-write-love-letter-modern-couples',
  'how-to-write-marriage-proposal-speech',
  'marriage-proposal-ideas-india',
  'long-distance-relationship-anniversary-celebration-ideas',
  'long-distance-relationship-india-h1b-tips',
  'long-distance-relationship-ms-students-survival-guide',
  'long-distance-relationship-after-marriage-tips',
  'long-distance-birthday-surprise-ideas-india',
  'long-distance-parents-abroad-occasion-pages',
  'long-distance-friend-misses-you-page-ideas',
  'military-couples-india-deployment-message-ideas',
  'how-to-say-i-miss-you-long-distance',
  'how-to-make-personalized-love-page-online',
  'surprise-your-partner-with-a-website',
  'website-for-couples',
  'relationship-timeline-website',
  'personalized-couples-day-gift-website',
  'our-story-website-ideas',
  'how-to-make-a-couple-website',
  'cute-couple-website-examples',
  'couple-website-ideas',
  // Girlfriend Special
  'girlfriend-day-wishes-2026',
  'girlfriend-day-gifts-under-500-rupees',
  'girlfriend-day-gift-ideas-2026',
  'girlfriend-gifts-by-relationship-stage',
  'surprise-your-girlfriend-with-a-website',
  'website-for-my-girlfriend',
  'cute-website-for-my-girlfriend',
  'romantic-website-ideas-for-girlfriend',
  'when-is-girlfriend-day-2026',
  'national-girlfriend-day-history-origin',
  'national-girlfriend-day-2026-ideas-messages',
  'happy-girlfriend-day-whatsapp-status-ideas',
  'personalized-website-gift-for-girlfriend',
  'love-website-for-girlfriend-examples',
  'how-to-make-a-website-for-your-girlfriend',
  'how-to-celebrate-girlfriend-day',
  'online-gift-for-girlfriend',
  'digital-gifts-for-girlfriend',
  'unique-gift-ideas-for-girlfriend-2026',
  'last-minute-girlfriend-day-gift-ideas',
  'girlfriend-day-mistakes-to-avoid',
  'girlfriend-day-long-distance-ideas',
  'girlfriend-day-ideas-college-couples-india',
  'girlfriend-day-dates-2026-to-2030',
  'girlfriend-day-vs-valentines-day',
  'girlfriend-day-surprise-ideas',
  'girlfriend-day-photo-memories-ideas',
  'girlfriend-day-letter-what-to-write',
  'girlfriend-day-in-india-2026',
  'first-girlfriend-day-new-relationship',
  'gifts-for-long-distance-girlfriend-india',
  'what-to-gift-girlfriend-on-girlfriend-day',
  'cost-to-make-a-website-for-girlfriend',
  'girlfriend-day-quotes-captions-instagram',
  // Couples
  'couples-day-2026-india',
  'couples-day-gift-ideas-2026',
  'when-is-couples-day-2026',
  'national-couples-day-2026',
  'national-couples-day-history-origin',
  'couples-day-dates-2026-to-2030',
  'couples-day-august-18-or-26',
  'couple-holidays-calendar-2026',
  'couples-day-vs-valentines-day',
  'happy-couples-day-meaning-reply',
  'happy-couples-day-wishes-for-friends',
  'happy-couples-day-wishes-2026',
  'couples-day-wishes-husband-wife',
  'couples-day-whatsapp-status-ideas',
  'couples-day-shayari-hinglish-status',
  'couples-day-quotes-captions-instagram',
  'couples-day-message-for-girlfriend',
  'couples-day-message-for-boyfriend',
  'couples-day-letter-unsaid-things',
  'couples-day-ideas-married-couples',
  'couples-day-ideas-college-couples-india',
  'couples-day-ideas-at-home',
  'couples-day-gift-for-girlfriend',
  'couples-day-gift-for-boyfriend',
  'couples-day-gifts-under-500-rupees',
  'couples-day-surprise-ideas',
  'couples-day-photo-ideas',
  'couples-day-date-ideas-india',
  'couples-day-mistakes-to-avoid',
  'couples-day-long-distance-ideas',
  'what-to-gift-on-couples-day',
  'online-gifts-for-couples',
  'matching-gifts-for-couples',
  'last-minute-couples-day-gifts',
  'handmade-vs-online-couples-day-gifts',
  'digital-gifts-for-couples',
  'how-to-celebrate-couples-day',
  'first-couples-day-new-relationship',
  'couple-games-for-couples-day',
  'couple-scoreboard-ideas',
  // Anniversary
  'first-anniversary-personalized-page-ideas',
  '5-year-anniversary-memory-book-ideas',
  '25-year-silver-anniversary-personalized-tribute',
  '10-year-anniversary-celebration-online',
  'monthsary-celebration-ideas-young-couples',
  'dating-anniversary-vs-wedding-anniversary-ideas',
  // Apology
  'how-to-apologize-sincerely',
  'how-to-write-apology-letter-to-girlfriend',
  'how-to-apologize-to-best-friend-after-fight',
  'how-to-apologize-to-parents-grown-up-perspective',
  'how-to-apologize-after-long-silence-letter-template',
  'how-to-forgive-someone-letter-template',
  'apology-after-cheating-honest-structure',
  // Digital & How-To
  'how-to-make-a-couple-website',
  'cost-to-make-couple-website',
  'best-romantic-website-builders-2026-comparison',
  'digital-vs-physical-gifting-india-2026-trends',
  'why-young-indians-prefer-digital-greetings-data',
  'earn-money-selling-website-templates-india-2026',
  'top-personalized-card-apps-india-2026',
  'best-free-greeting-card-makers-india-2026',
  'paid-vs-free-greeting-card-sites-honest-breakdown',
  'whatsapp-greeting-templates-vs-personalized-pages',
  'instagram-reels-greeting-trends-india-2026',
  'personalized-gifting-market-india-2026-data-insights',
  'onlinewishes-vs-canva-greeting-cards',
  'onlinewishes-vs-paperless-post-honest-comparison',
  'onlinewishes-vs-greetings-island-india-comparison',
  'onlinewishes-vs-123greetings-personalized-vs-generic',
  // Indian Occasions
  'raksha-bandhan-2026-wishes-messages-sister-brother',
  'raksha-bandhan-2026-digital-rakhi-page-distant-siblings',
  'diwali-2026-digital-companion-physical-gift',
  'holi-2026-colorful-page-for-loved-ones-abroad',
  'eid-mubarak-2026-personalized-page-ideas',
  'mothers-day-india-2026-personalized-tribute',
  'fathers-day-india-2026-personalized-tribute',
  'teachers-day-2026-thank-you-messages-india',
  'pongal-onam-lohri-regional-greeting-ideas',
  'karva-chauth-2026-online-ways-to-celebrate-when-apart',
  'bhai-dooj-2026-sister-brother-message-ideas',
  // Wedding
  'how-to-write-wedding-vows-india-edition',
  'wedding-day-message-to-bride-groom-ideas',
  'wedding-anniversary-vow-renewal-page-ideas',
  'pre-wedding-letter-to-partner-night-before-wedding',
  'how-to-write-thank-you-note-after-wedding',
  'groom-best-man-message-wedding-day',
  'bridesmaid-best-friend-message-wedding-day',
  'engagement-roka-online-invitation-card',
  'engagement-announcement-online-page-india',
  // Special
  'how-to-write-birthday-poem-for-someone-special',
  'how-to-write-best-man-toast-india',
  'how-to-tell-someone-you-have-feelings-online',
  'how-to-write-eulogy-loved-one-personal',
  'how-to-write-first-anniversary-letter',
  'coming-out-to-best-friend-letter-template',
  'confession-after-years-of-silence-message-ideas',
  'republic-day-romantic-message-ideas',
  'christmas-india-2026-secret-santa-messages',
  'housewarming-griha-pravesh-invitation-online',
  'annaprashan-first-rice-ceremony-online-invitation',
  'mundan-ceremony-invitation-page-india',
  'namkaran-online-invitation-2026-complete-guide',
];

const today = new Date().toISOString().split('T')[0];

async function run() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const distDir = path.join(process.cwd(), 'dist');

    // Remove old sitemap files
    fs.readdirSync(publicDir).forEach(file => {
      if (file.startsWith('sitemap') && file !== 'sitemap.xml' && file !== 'sitemap-index.xml' && file !== 'sitemap-flat.xml') {
        try {
          fs.unlinkSync(path.join(publicDir, file));
        } catch (_) {}
      }
    });

    // 1. Generate sitemap-pages.xml (main routes)
    const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${mainRoutes.map(
      (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n')}\n</urlset>`;
    fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), pagesXml, 'utf8');

    // 2. Generate sitemap-blog.xml for all blog posts
    const blogRoutes = blogSlugs.map(slug => ({
      url: `/blog/${slug}`,
      priority: '0.6',
      changefreq: 'monthly'
    }));
    const blogXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blogRoutes.map(
      (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n')}\n</urlset>`;
    fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), blogXml, 'utf8');

    const sitemapsList = ['sitemap-pages.xml', 'sitemap-blog.xml'];
    let consolidatedRoutes = [...mainRoutes, ...blogRoutes];

    // 3. Generate sitemap-template-*.xml for each template
    templates.forEach(template => {
      const templateRoutes = [
        { url: `/${template}`, priority: '0.9', changefreq: 'weekly' },
        { url: `/${template}/customize`, priority: '0.8', changefreq: 'monthly' },
        { url: `/${template}/preview`, priority: '0.8', changefreq: 'monthly' }
      ];

      consolidatedRoutes.push(...templateRoutes);

      const templateXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${templateRoutes.map(
        (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
      ).join('\n')}\n</urlset>`;

      const filename = `sitemap-template-${template}.xml`;
      fs.writeFileSync(path.join(publicDir, filename), templateXml, 'utf8');
      sitemapsList.push(filename);
    });

    // 4. Delete sizesnap sitemaps if they exist
    try {
      const sizesnapPublicPath = path.join(publicDir, 'sitemap-sizesnap.xml');
      if (fs.existsSync(sizesnapPublicPath)) {
        fs.unlinkSync(sizesnapPublicPath);
      }
      const sizesnapDistPath = path.join(distDir, 'sitemap-sizesnap.xml');
      if (fs.existsSync(sizesnapDistPath)) {
        fs.unlinkSync(sizesnapDistPath);
      }
    } catch (_) {}

    // 5. Generate master sitemap-flat.xml as a consolidated flat urlset
    const consolidatedSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${consolidatedRoutes.map(
      (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n')}\n</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap-flat.xml'), consolidatedSitemapXml, 'utf8');

    // 6. Generate master sitemap-index.xml and sitemap.xml
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapsList.map(
      (filename) => `  <sitemap>\n    <loc>${SITE_URL}/${filename}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
    ).join('\n')}\n</sitemapindex>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), consolidatedSitemapXml, 'utf8');

    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\nSitemap: ${SITE_URL}/sitemap-index.xml\nSitemap: ${SITE_URL}/sitemap-flat.xml`;
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

    console.log(`[SEO] Generated flat consolidated sitemap-flat.xml, clean sitemap.xml (Index), sitemap-index.xml (Index), and sub-sitemaps in public/`);
    console.log(`[SEO] Total URLs indexed: ${consolidatedRoutes.length} (including ${blogRoutes.length} blog posts)`);

    if (fs.existsSync(distDir)) {
      fs.readdirSync(distDir).forEach(file => {
        if (file.startsWith('sitemap') && file !== 'sitemap.xml' && file !== 'sitemap-index.xml' && file !== 'sitemap-flat.xml') {
          try {
            fs.unlinkSync(path.join(distDir, file));
          } catch (_) {}
        }
      });
      fs.cpSync(publicDir, distDir, { recursive: true });
      console.log(`[SEO] Copied sitemaps and robots.txt to dist/`);
    }

  } catch (err) {
    console.error('[SEO] Failed to generate sitemap:', err);
  }
}

run();
