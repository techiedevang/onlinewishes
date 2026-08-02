const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

const hookCode = `
  // Abandoned Draft Email Trigger
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only send if logged in, hasn't paid, and has done some customization
      if (currentUser && currentUser.email && customization.paymentStatus !== 'completed') {
        const payload = JSON.stringify({ 
          email: currentUser.email, 
          name: currentUser.name, 
          templateName: TEMPLATES.find(t => t.id === customization.bgTheme)?.title || 'Memory Scrapbook'
        });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/send-draft-reminder', blob);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, customization.paymentStatus, customization.bgTheme]);

`;

if (!content.includes('// Abandoned Draft Email Trigger')) {
  // Insert right before handleSaveToCloudDatabase
  content = content.replace(
    '  // Save customization to Cloud Firestore Database',
    hookCode + '  // Save customization to Cloud Firestore Database'
  );
  fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
}
