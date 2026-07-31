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
  { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
  { url: '/refund-policy', priority: '0.5', changefreq: 'yearly' }
];

const templates = [
  'box21-surprise',
  'romantic-love-story',
  'bestie-chaos-polaroid',
  'sisterhood-gratitude-tree',
  'birthday-confetti-party',
  'retro-90s-arcade',
  'celestial-galaxy',
  'minimalist-editorial',
  'vintage-parchment',
  'sunset-romance',
  'neon-cyberpunk',
  'fairy-tale',
  'elegant-wedding',
  'graduation-memories'
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
    const oldFiles = [
      'sitemap-pages.xml',
      'sitemap-features.xml',
      'sitemap-scrapbooks-1.xml',
      'sitemap-template-box21-surprise.xml', // Just clean up by regenerating the flat one
    ];
    fs.readdirSync(publicDir).forEach(file => {
      if (file.startsWith('sitemap') && file !== 'sitemap.xml') {
        fs.unlinkSync(path.join(publicDir, file));
      }
    });

    let allRoutes = [...mainRoutes];

    templates.forEach(template => {
      allRoutes.push({ url: `/${template}`, priority: '0.9', changefreq: 'monthly' });
      allRoutes.push({ url: `/${template}/customize`, priority: '0.8', changefreq: 'monthly' });
      allRoutes.push({ url: `/${template}/preview`, priority: '0.8', changefreq: 'monthly' });
    });

    // User scrapbooks (/p/...) are private and excluded from public sitemaps per privacy requirement.

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allRoutes.map(
      (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n')}\n</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml`;
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

    console.log(`[SEO] Generated flat sitemap.xml and robots.txt in public/`);

    if (fs.existsSync(distDir)) {
      fs.cpSync(publicDir, distDir, { recursive: true });
      console.log(`[SEO] Copied sitemap.xml and robots.txt to dist/`);
    }

  } catch (err) {
    console.error('[SEO] Failed to generate sitemap:', err);
  }
}

run();
