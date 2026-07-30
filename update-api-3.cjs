const fs = require('fs');

function polyfillFetch(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('node-fetch')) {
    content = 'import fetch from "node-fetch";\n' + content;
  }
  
  fs.writeFileSync(filePath, content);
}

polyfillFetch('api/admin/send-otp.js');
polyfillFetch('api/admin/verify-otp.js');
