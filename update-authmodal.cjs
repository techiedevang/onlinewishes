const fs = require('fs');
let content = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

const welcomeCall = `
      // Send welcome email
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, name: trimmedName })
        });
      } catch (e) {
        console.error('Failed to send welcome email', e);
      }
`;

if (!content.includes('/api/send-welcome')) {
  content = content.replace(
    /const newUser: User = \{/,
    welcomeCall + '\n      const newUser: User = {'
  );
  fs.writeFileSync('src/components/AuthModal.tsx', content);
}
