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
}

const DEFAULT_TITLE = 'OnlineWishes - Personalized Digital Surprises & Scrapbooks';
const DEFAULT_DESC = 'Create personalized digital surprises, memory books, birthday websites, and love scrapbooks for your loved ones at onlinewishes.in.';
const DEFAULT_KEYWORDS = 'online wishes, digital surprise website, birthday surprise website, memory scrapbook, love letter website, online greeting card, custom surprise link';
const DEFAULT_URL = 'https://onlinewishes.in/';
const DEFAULT_OG_IMAGE = 'https://onlinewishes.in/favicon.svg';

export function updatePageMetadata(options: MetaDataOptions = {}) {
  const title = options.title ? `${options.title} | OnlineWishes` : DEFAULT_TITLE;
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
}

/**
 * Utility to set SEO metadata for a specific template
 */
export function updateMetadataForTemplate(templateName: string, templateCategory: string, templateDescription?: string, thumbnailImage?: string) {
  updatePageMetadata({
    title: `${templateName} - ${templateCategory.toUpperCase()} Surprise Website`,
    description: templateDescription || `Customize the ${templateName} digital gift website with photos, music, secret passcodes and custom messages.`,
    keywords: `${templateName.toLowerCase()}, ${templateCategory.toLowerCase()} surprise, digital scrapbook, custom website gift, onlinewishes`,
    ogTitle: `${templateName} | OnlineWishes Custom Gift`,
    ogDescription: templateDescription,
    ogImage: thumbnailImage || DEFAULT_OG_IMAGE,
  });
}
