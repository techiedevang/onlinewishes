import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://onlinewishes.in';

const routes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/#templates', priority: '0.9', changefreq: 'weekly' },
  { url: '/#pricing', priority: '0.8', changefreq: 'monthly' },
  { url: '/#custom-ai', priority: '0.7', changefreq: 'monthly' }
];

const today = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

try {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemapXml, 'utf8');
  console.log(`[SEO] Generated sitemap at ${publicPath}`);

  const distDir = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, sitemapXml, 'utf8');
    console.log(`[SEO] Generated sitemap at ${distPath}`);
  }
} catch (err) {
  console.error('[SEO] Failed to generate sitemap:', err);
}
