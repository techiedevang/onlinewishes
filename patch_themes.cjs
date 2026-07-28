const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

if (!content.includes("import { TEMPLATES }")) {
    content = content.replace("import { saveScrapbookToCloud, loadScrapbookFromCloud } from '../lib/scrapbookService';", "import { saveScrapbookToCloud, loadScrapbookFromCloud } from '../lib/scrapbookService';\nimport { TEMPLATES } from '../data/templates';");
}

const oldSwitchRegex = /\{\(\(\) => \{\n\s*const occasion = customization\.occasion;\n\s*let themes = \[\];\n\s*switch \(occasion\) \{[\s\S]*?return themes\.map\(\(theme\) => \(/;

const newThemes = `{TEMPLATES.map((theme) => (`;

content = content.replace(oldSwitchRegex, newThemes);

fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
