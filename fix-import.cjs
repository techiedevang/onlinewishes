const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  /const _filename = typeof __filename !== 'undefined' \? __filename : fileURLToPath\(import\.meta\.url\);\nconst _dirname = typeof __dirname !== 'undefined' \? __dirname : path\.dirname\(_filename\);\n/g,
  ''
);

content = content.replace(
  /path\.join\(_dirname, "firebase-applet-config\.json"\),\n      path\.join\(_dirname, "\.\.\/firebase-applet-config\.json"\)/g,
  `path.join(process.cwd(), "../firebase-applet-config.json")`
);

fs.writeFileSync('server.ts', content);
