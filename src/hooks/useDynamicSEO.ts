import { useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TEMPLATES } from '../data/templates';
import { updatePageMetadata, updateMetadataForTemplate } from '../utils/seo';

export function useDynamicSEO(currentPath: string, activeTab: string, customizationParams?: any) {
  useEffect(() => {
    async function fetchAndSetMetadata() {
      let slug = '';
      if (currentPath.startsWith('/p/')) {
        slug = currentPath.split('/p/')[1];
      } else {
        const searchParams = new URLSearchParams(window.location.search);
        slug = searchParams.get('p') || searchParams.get('id') || searchParams.get('subdomain') || '';
      }

      // 1. Scrapbook Route
      if (slug && slug !== 'admin') {
        try {
          const q = query(collection(db, 'scrapbooks'), where('subdomain', '==', slug));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            updatePageMetadata({
              title: `${data.recipientName}'s Custom Surprise Scrapbook`,
              description: `Open this beautiful surprise scrapbook created with love for ${data.recipientName} by ${data.senderName || 'their friend'} on OnlineWishes.`,
              ogTitle: `A Surprise for ${data.recipientName}! ❤️`,
              ogDescription: `Created by ${data.senderName || 'their friend'} for ${data.recipientName}. Open to unwrap the memories and messages!`,
              ogImage: data.ogImageUrl || (data.memories && data.memories.length > 0 ? data.memories[0].imageUrl : undefined),
              canonicalUrl: `https://onlinewishes.in/p/${data.subdomain}`,
              structuredData: {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": `${data.recipientName}'s Custom Surprise Scrapbook`,
                "description": `Surprise scrapbook created for ${data.recipientName}.`,
                "url": `https://onlinewishes.in/p/${data.subdomain}`,
                "publisher": {
                  "@type": "Organization",
                  "name": "OnlineWishes",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://onlinewishes.in/favicon.svg"
                  }
                }
              }
            });
            return;
          }
        } catch (err) {
          console.error('Error fetching SEO metadata for scrapbook:', err);
        }
      }

      // 2. Admin Route
      if (currentPath.startsWith('/admin') || activeTab === 'admin') {
        updatePageMetadata({
          title: 'Admin Dashboard',
          description: 'OnlineWishes administration dashboard and user management.',
          canonicalUrl: 'https://onlinewishes.in/admin',
        });
        return;
      }

      // 3. Template Routes (Detail, Customizer, Preview)
      if (currentPath.length > 1 && !currentPath.startsWith('/p/') && !currentPath.startsWith('/admin')) {
        let isCustomize = currentPath.endsWith('/customize') || activeTab === 'customizer';
        let isPreview = currentPath.endsWith('/preview');
        let possibleTemplateId = currentPath.substring(1);
        
        if (possibleTemplateId.endsWith('/customize')) {
           possibleTemplateId = possibleTemplateId.replace('/customize', '');
        } else if (possibleTemplateId.endsWith('/preview')) {
           possibleTemplateId = possibleTemplateId.replace('/preview', '');
        }
        
        const template = TEMPLATES.find(t => t.id === possibleTemplateId);
        if (template) {
          const subPath = isCustomize ? 'customize' : isPreview ? 'preview' : '';
          updateMetadataForTemplate(template.id, template.title, template.category, template.description, template.thumbnail, subPath);
          return;
        }
      }

      // 4. Customizer Route (Generic)
      if (activeTab === 'customizer') {
        const recipientName = customizationParams?.recipientName || 'Your Loved One';
        updatePageMetadata({
          title: `Customize ${recipientName}'s Surprise Page`,
          description: `Personalize photos, custom love letters, background music, and secret passcode for ${recipientName} on OnlineWishes.in.`,
          canonicalUrl: 'https://onlinewishes.in/customize',
        });
        return;
      }

      // 5. Static Tab Pages
      if (activeTab === 'templates' || currentPath === '/templates') {
        updatePageMetadata({
          title: 'All Scrapbook & Birthday Surprise Templates',
          description: 'Explore 14+ interactive surprise website templates for besties, lovers, sisters, birthdays, and anniversaries on OnlineWishes.in.',
          canonicalUrl: 'https://onlinewishes.in/templates',
        });
        return;
      }

      if (activeTab === 'pricing' || currentPath === '/pricing') {
        updatePageMetadata({
          title: 'Pricing & Custom AI Website Plans',
          description: 'All interactive templates at flat Rs. 49 and custom AI website blueprints at flat Rs. 79. Instant delivery with zero subscription fees.',
          canonicalUrl: 'https://onlinewishes.in/pricing',
        });
        return;
      }

      if (activeTab === 'custom_AI' || currentPath === '/custom_AI') {
        updatePageMetadata({
          title: 'AI Custom Website Blueprint Generator',
          description: 'Tell our AI Architect your idea and get a bespoke custom surprise website blueprint generated in seconds.',
          canonicalUrl: 'https://onlinewishes.in/custom_AI',
        });
        return;
      }

      // 6. Default Homepage
      updatePageMetadata({
        title: 'OnlineWishes.in - Personalized Digital Surprises & Scrapbooks',
        description: 'Create personalized digital surprises, memory books, birthday websites, and love scrapbooks for your loved ones at onlinewishes.in. Make their day special with custom digital gifts.',
        canonicalUrl: 'https://onlinewishes.in/',
      });
    }

    fetchAndSetMetadata();
  }, [currentPath, activeTab, customizationParams]);
}
