const fs = require('fs');
let code = fs.readFileSync('src/components/CustomAiIdeaModal.tsx', 'utf8');

// Fix duplicates
code = code.replace(/dark:bg-white dark:bg-slate-950/g, 'dark:bg-slate-950');
code = code.replace(/bg-white dark:bg-slate-100 dark:bg-slate-900/g, 'bg-white dark:bg-slate-900');
code = code.replace(/border-slate-200 dark:border-slate-200 dark:border-slate-800/g, 'border-slate-200 dark:border-slate-800');
code = code.replace(/text-slate-900 dark:text-slate-900 dark:text-slate-100/g, 'text-slate-900 dark:text-slate-100');
code = code.replace(/bg-slate-50 dark:bg-slate-100 dark:bg-slate-900/g, 'bg-slate-50 dark:bg-slate-900');
code = code.replace(/text-slate-500 dark:text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-400');
code = code.replace(/text-slate-600 dark:text-slate-600 dark:text-slate-300/g, 'text-slate-600 dark:text-slate-300');
code = code.replace(/text-slate-700 dark:text-slate-700 dark:text-slate-200/g, 'text-slate-700 dark:text-slate-200');
code = code.replace(/bg-slate-100 dark:bg-slate-100 dark:bg-slate-900/g, 'bg-slate-100 dark:bg-slate-900');
code = code.replace(/bg-slate-200 dark:bg-slate-200 dark:bg-slate-800/g, 'bg-slate-200 dark:bg-slate-800');
code = code.replace(/border-slate-300 dark:border-slate-300 dark:border-slate-700/g, 'border-slate-300 dark:border-slate-700');
code = code.replace(/hover:bg-slate-300 dark:hover:bg-slate-300 dark:hover:bg-slate-700/g, 'hover:bg-slate-300 dark:hover:bg-slate-700');
code = code.replace(/hover:bg-slate-200 dark:hover:bg-slate-200 dark:hover:bg-slate-800/g, 'hover:bg-slate-200 dark:hover:bg-slate-800');

fs.writeFileSync('src/components/CustomAiIdeaModal.tsx', code);
