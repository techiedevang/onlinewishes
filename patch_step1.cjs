const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

const oldJsx = `              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Occasion Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'bestie', label: '👭 Bestie' },
                    { id: 'friendship', label: '🌟 Friendship' },
                    { id: 'girlfriend', label: '❤️ Partner' },
                    { id: 'sister', label: '🌸 Sister' },
                    { id: 'birthday', label: '🎉 Birthday' },
                    { id: 'anniversary', label: '🥂 Anniversary' },
                    { id: 'wedding', label: '💍 Wedding' },
                  ].map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => updateField('occasion', occ.id as OccasionType)}
                      className={\`p-3 rounded-xl border text-xs font-bold transition-all text-center \${
                        customization.occasion === occ.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }\`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose a Template Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEMPLATES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => updateField('bgTheme', theme.id)}
                        className={\`p-3 rounded-xl border text-xs font-bold transition-all text-center \${
                          customization.bgTheme === theme.id || (!customization.bgTheme && theme.id === TEMPLATES[0].id)
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }\`}
                      >
                        {theme.badge.split(' ')[0]} {theme.title.split(' ')[0]} {theme.title.split(' ')[1] || ''}
                      </button>
                    ))}
                </div>
              </div>`;

const newJsx = `              {/* Selected Template Display */}
              <div className="bg-gradient-to-r from-slate-100 to-rose-50 dark:from-slate-800 dark:to-rose-950/30 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/50 flex flex-col md:flex-row gap-4 items-center md:items-start justify-between shadow-sm">
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Currently Customizing</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedTemplate?.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTemplate?.features.map((feat, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700">
                     <SafeImage src={selectedTemplate?.thumbnail || ''} fallbackUrl="" alt="Template" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>`;

if (content.includes("Occasion Type")) {
  content = content.replace(oldJsx, newJsx);
  fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
  console.log("Replaced Occasion and Template Selectors");
} else {
  console.log("Could not find the target code to replace.");
}
