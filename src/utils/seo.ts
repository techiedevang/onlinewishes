/**
 * SEO Utility to dynamically update document title, meta description, keywords, Open Graph, and Canonical URLs
 * based on selected template, view, or user interaction.
 */

export interface MetaDataOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: any;
}

const DEFAULT_TITLE = 'OnlineWishes - Personalized Digital Surprises & Scrapbooks';
const DEFAULT_DESC = 'Create personalized digital surprises, memory books, birthday websites, and love scrapbooks for your loved ones at onlinewishes.in.';
const DEFAULT_KEYWORDS = 'online wishes, digital surprise website, birthday surprise website, memory scrapbook, love letter website, online greeting card, custom surprise link';
const DEFAULT_URL = 'https://onlinewishes.in/';
const DEFAULT_OG_IMAGE = 'https://onlinewishes.in/favicon.svg';

export function updatePageMetadata(options: MetaDataOptions = {}) {
  let title = DEFAULT_TITLE;
  if (options.title) {
    title = options.title.includes('OnlineWishes') ? options.title : `${options.title} | OnlineWishes`;
  }
  const description = options.description || DEFAULT_DESC;
  const keywords = options.keywords || DEFAULT_KEYWORDS;
  const url = options.canonicalUrl || DEFAULT_URL;
  const ogTitle = options.ogTitle || title;
  const ogDescription = options.ogDescription || description;
  const ogImage = options.ogImage || DEFAULT_OG_IMAGE;

  // Update document title
  document.title = title;

  // Helper function to set or create meta tag
  const setMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', contentVal);
  };

  // Helper function to set or create link tag
  const setLinkTag = (rel: string, hrefVal: string) => {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', hrefVal);
  };

  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
  
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', ogTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);

  setMetaTag('meta[property="twitter:title"]', 'property', 'twitter:title', ogTitle);
  setMetaTag('meta[property="twitter:description"]', 'property', 'twitter:description', ogDescription);
  setMetaTag('meta[property="twitter:image"]', 'property', 'twitter:image', ogImage);

  setLinkTag('canonical', url);

  // Structured Data (JSON-LD)
  let scriptEl = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }
  
  if (options.structuredData) {
    scriptEl.textContent = JSON.stringify(options.structuredData);
  } else {
    // Default Schema
    scriptEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "OnlineWishes",
      "url": "https://onlinewishes.in/",
      "description": DEFAULT_DESC,
      "publisher": {
        "@type": "Organization",
        "name": "OnlineWishes",
        "logo": {
          "@type": "ImageObject",
          "url": "https://onlinewishes.in/favicon.svg"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://onlinewishes.in/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    });
  }
}

/**
 * Utility to set SEO metadata for a specific template
 */
export function updateMetadataForTemplate(
  templateId: string,
  templateName: string,
  templateCategory: string,
  templateDescription?: string,
  thumbnailImage?: string,
  subPath: '' | 'customize' | 'preview' = ''
) {
  let canonicalUrl = `https://onlinewishes.in/${templateId}`;
  let title = `${templateName} - ${templateCategory.toUpperCase()} Surprise Website`;
  let description = templateDescription || `Customize the ${templateName} digital gift website with photos, music, secret passcodes and custom messages on OnlineWishes.in.`;

  if (subPath === 'customize') {
    canonicalUrl = `https://onlinewishes.in/${templateId}/customize`;
    title = `Customize ${templateName} Surprise Website`;
    description = `Personalize the ${templateName} surprise website with custom photos, love letters, background music, secret passcode, and instant WhatsApp share link.`;
  } else if (subPath === 'preview') {
    canonicalUrl = `https://onlinewishes.in/${templateId}/preview`;
    title = `Live Preview: ${templateName} Surprise Website`;
    description = `Interactive live preview of ${templateName} surprise website on OnlineWishes.in.`;
  }

  updatePageMetadata({
    title,
    description,
    keywords: `${templateName.toLowerCase()}, ${templateCategory.toLowerCase()} surprise, digital scrapbook, custom website gift, onlinewishes`,
    canonicalUrl,
    ogTitle: `${title} | OnlineWishes`,
    ogDescription: description,
    ogImage: thumbnailImage || DEFAULT_OG_IMAGE,
  });
}
