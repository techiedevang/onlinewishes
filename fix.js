const fs = require('fs');
let content = fs.readFileSync('src/components/CustomAiIdeaModal.tsx', 'utf8');
content = content.replace(/Rs\. \{/g, '${');
// also fix the Rs. 19, Rs. 29, Rs. 39 etc
content = content.replace(/\(\$19\)/g, '(Rs. 19)').replace(/\(\$29\)/g, '(Rs. 29)').replace(/\(\$39\)/g, '(Rs. 39)');
fs.writeFileSync('src/components/CustomAiIdeaModal.tsx', content);
