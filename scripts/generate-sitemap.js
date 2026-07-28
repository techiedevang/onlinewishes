import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://onlinewishes.in';

const mainRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/#templates', priority: '0.9', changefreq: 'weekly' },
  { url: '/#pricing', priority: '0.8', changefreq: 'monthly' },
  { url: '/#custom-ai', priority: '0.8', changefreq: 'monthly' },
  { url: '/#how-it-works', priority: '0.7', changefreq: 'monthly' },
  { url: '/#reviews', priority: '0.7', changefreq: 'monthly' },
  { url: '/#contact', priority: '0.6', changefreq: 'monthly' },
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
  'vintage-parchment'
];

const today = new Date().toISOString().split('T')[0];

function generateUrlSet(routes) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(
  (route) => `  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
).join('\n')}
</urlset>`;
}

try {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const distDir = path.join(process.cwd(), 'dist');

  // 1. Generate Main Sitemap
  const sitemapMainXml = generateUrlSet(mainRoutes);
  fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), sitemapMainXml, 'utf8');

  // 2. Generate Individual Template Sitemaps
  const sitemapIndexEntries = [];
  
  sitemapIndexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-pages.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);

  templates.forEach(template => {
    const templateXml = generateUrlSet([
      { url: `/?template=${template}`, priority: '0.9', changefreq: 'monthly' }
    ]);
    const filename = `sitemap-${template}.xml`;
    fs.writeFileSync(path.join(publicDir, filename), templateXml, 'utf8');
    sitemapIndexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/${filename}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
  });

  // 3. Generate Sitemap Index (sitemap.xml)
  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries.join('\n')}
</sitemapindex>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf8');
  console.log(`[SEO] Generated sitemap index and individual sitemaps in public/`);

  // Copy to dist if it exists
  if (fs.existsSync(distDir)) {
    fs.cpSync(publicDir, distDir, { recursive: true });
    console.log(`[SEO] Copied sitemaps to dist/`);
  }

} catch (err) {
  console.error('[SEO] Failed to generate sitemaps:', err);
}
