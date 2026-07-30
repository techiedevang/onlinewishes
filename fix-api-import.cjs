const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(
    /path\.join\(path\.dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.\/\.\.\/firebase-applet-config\.json"\),\n      path\.join\(path\.dirname\(fileURLToPath\(import\.meta\.url\)\), "\.\.\/firebase-applet-config\.json"\)/g,
    `path.join(process.cwd(), "../firebase-applet-config.json")`
  );

  fs.writeFileSync(filePath, content);
}

fixFile('api/admin/send-otp.js');
fixFile('api/admin/verify-otp.js');
