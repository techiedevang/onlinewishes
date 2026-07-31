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
    fs.readdirSync(publicDir).forEach(file => {
      if (file.startsWith('sitemap') && file !== 'sitemap.xml' && file !== 'sitemap-index.xml' && file !== 'sitemap-flat.xml') {
        try {
          fs.unlinkSync(path.join(publicDir, file));
        } catch (_) {}
      }
    });

    // 1. Generate sitemap-pages.xml
    const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${mainRoutes.map(
      (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n')}\n</urlset>`;
    fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), pagesXml, 'utf8');

    const sitemapsList = ['sitemap-pages.xml'];
    let consolidatedRoutes = [...mainRoutes];

    // 2. Generate sitemap-template-*.xml for each template
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

    // 3. Delete sizesnap sitemaps if they exist
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

    // 4. Generate master sitemap-flat.xml as a consolidated flat urlset containing all URLs of your website
    const consolidatedSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${consolidatedRoutes.map(
      (route) => `  <url>\n    <loc>${SITE_URL}${route.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
    ).join('\n')}\n</urlset>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap-flat.xml'), consolidatedSitemapXml, 'utf8');

    // 5. Generate master sitemap.xml as Sitemap Index (containing all <sitemap> tags)
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapsList.map(
      (filename) => `  <sitemap>\n    <loc>${SITE_URL}/${filename}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
    ).join('\n')}\n</sitemapindex>`;

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');

    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\nSitemap: ${SITE_URL}/sitemap-index.xml\nSitemap: ${SITE_URL}/sitemap-flat.xml`;
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

    console.log(`[SEO] Generated flat consolidated sitemap-flat.xml, sitemap.xml (Index), sitemap-index.xml (Index), and sub-sitemaps in public/`);

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
