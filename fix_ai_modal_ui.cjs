const fs = require('fs');
let code = fs.readFileSync('src/components/CustomAiIdeaModal.tsx', 'utf8');

// 1. Fix the main background behind the form
code = code.replace(
  /className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 flex items-center justify-center overflow-y-auto"/,
  'className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-12 px-4 flex items-center justify-center overflow-y-auto"'
);

// 2. Fix the heading text color visibility
code = code.replace(
  /<h3 className="text-lg sm:text-xl font-extrabold flex items-center space-x-2">/g,
  '<h3 className="text-lg sm:text-xl font-extrabold flex items-center space-x-2 text-slate-900 dark:text-white">'
);

// 3. Fix the form inner background which was white
code = code.replace(
  /className="bg-white dark:bg-slate-950\/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"/g,
  'className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-4"'
);

// 4. Update the inner success/summary box background to not be pure white if present
code = code.replace(
  /className="bg-white dark:bg-slate-950\/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs"/g,
  'className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-left space-y-2 text-xs"'
);

fs.writeFileSync('src/components/CustomAiIdeaModal.tsx', code);
