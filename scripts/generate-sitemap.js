import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  'vintage-parchment',
  'sunset-romance',
  'neon-cyberpunk',
  'fairy-tale',
  'elegant-wedding',
  'graduation-memories'
];

const featurePages = [
  'create-scrapbook',
  'birthday-wishes-maker',
  'online-greeting-cards',
  'love-letter-website',
  'digital-gifts',
  'interactive-surprises',
  'memory-lane-creator',
  'best-friend-gifts',
  'anniversary-surprises',
  'long-distance-relationship-gifts'
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

async function run() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const distDir = path.join(process.cwd(), 'dist');

    let scrapbookRoutes = [];
    try {
      const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      const snapshot = await getDocs(collection(db, 'scrapbooks'));
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.subdomain && !data.isLocked) { 
          scrapbookRoutes.push({ url: `/p/${data.subdomain}`, priority: '0.8', changefreq: 'weekly' });
        }
      });
      console.log(`[SEO] Fetched ${scrapbookRoutes.length} public scrapbooks for sitemap.`);
    } catch (err) {
      console.error('[SEO] Error fetching scrapbooks, skipping:', err);
    }

    // 1. Generate Main Sitemap
    const sitemapMainXml = generateUrlSet(mainRoutes);
    fs.writeFileSync(path.join(publicDir, 'sitemap-pages.xml'), sitemapMainXml, 'utf8');

    // 2. Generate Individual Template Sitemaps
    const sitemapIndexEntries = [];
    
    sitemapIndexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-pages.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);

    templates.forEach(template => {
      const templateXml = generateUrlSet([
        { url: `/?template=${template}`, priority: '0.9', changefreq: 'monthly' },
        { url: `/#preview-${template}`, priority: '0.8', changefreq: 'monthly' }
      ]);
      const filename = `sitemap-template-${template}.xml`;
      fs.writeFileSync(path.join(publicDir, filename), templateXml, 'utf8');
      sitemapIndexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/${filename}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
    });

    // Generate Feature Sitemaps
    const featureRoutes = featurePages.map(page => ({ url: `/#feature-${page}`, priority: '0.8', changefreq: 'monthly' }));
    const featureXml = generateUrlSet(featureRoutes);
    fs.writeFileSync(path.join(publicDir, 'sitemap-features.xml'), featureXml, 'utf8');
    sitemapIndexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/sitemap-features.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);

    // Generate Scrapbooks Sitemap
    if (scrapbookRoutes.length > 0) {
      const chunkSize = 10000;
      for (let i = 0; i < scrapbookRoutes.length; i += chunkSize) {
        const chunk = scrapbookRoutes.slice(i, i + chunkSize);
        const chunkXml = generateUrlSet(chunk);
        const filename = `sitemap-scrapbooks-${Math.floor(i / chunkSize) + 1}.xml`;
        fs.writeFileSync(path.join(publicDir, filename), chunkXml, 'utf8');
        sitemapIndexEntries.push(`  <sitemap>\n    <loc>${SITE_URL}/${filename}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
      }
    }

    // 3. Generate Sitemap Index (sitemap.xml)
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndexEntries.join('\n')}
</sitemapindex>`;
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndexXml, 'utf8');

    // 4. Generate robots.txt
    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml`;
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

    console.log(`[SEO] Generated sitemap index, individual sitemaps, and robots.txt in public/`);

    // Copy to dist if it exists
    if (fs.existsSync(distDir)) {
      fs.cpSync(publicDir, distDir, { recursive: true });
      console.log(`[SEO] Copied sitemaps and robots.txt to dist/`);
    }
  } catch (err) {
    console.error('[SEO] Failed to generate sitemaps:', err);
  }
}

run();
