const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

content = content.replace(/\)\);\n\s*\}\)\(\)\}/, "))}");
fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
