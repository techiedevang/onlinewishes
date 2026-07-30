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
        });
        return;
      }

      // 3. Customizer Route
      if (activeTab === 'customizer') {
        updatePageMetadata({
          title: `Customizing ${customizationParams?.recipientName || 'Your'}'s Surprise Page`,
          description: `Personalize photos, custom love letters, background music, and secret passcode for ${customizationParams?.recipientName || 'your loved one'} on OnlineWishes.`,
        });
        return;
      }

      // 4. Template Route
      if (currentPath.length > 1 && !currentPath.startsWith('/p/') && !currentPath.startsWith('/admin')) {
        let possibleTemplateId = currentPath.substring(1);
        if (possibleTemplateId.endsWith('/customize')) {
           possibleTemplateId = possibleTemplateId.replace('/customize', '');
        }
        
        const template = TEMPLATES.find(t => t.id === possibleTemplateId);
        if (template) {
          updateMetadataForTemplate(template.title, template.category, template.description, template.thumbnail);
          return;
        }
      }

      // 5. Default
      updatePageMetadata();
    }

    fetchAndSetMetadata();
  }, [currentPath, activeTab, customizationParams]);
}
