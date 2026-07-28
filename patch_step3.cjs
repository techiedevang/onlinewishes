const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

// Replace targetPhotoCount state with computed value
content = content.replace("const [targetPhotoCount, setTargetPhotoCount] = useState<number>(21);", "const selectedTemplate = TEMPLATES.find(t => t.id === customization.bgTheme);\n  const targetPhotoCount = selectedTemplate?.photoCount || 21;");

// Update JSX
const oldJsx = /\{\/\* Photo Count Target Presets \*\/\}[\s\S]*?\{\/\* Drag-and-Drop Native File Input Box \*\/\}/;

const newJsx = `{/* Photo Count Target Presets */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-rose-500" />
                      <span>{selectedTemplate?.title} Requires {targetPhotoCount} Photos</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Currently added: <strong className="text-rose-500 font-extrabold">{customization.memories.length}</strong> / {targetPhotoCount}
                    </p>
                  </div>
                  
                  {/* Auto-fill for testing/quick start */}
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => handleAutoFillSamplePhotos(targetPhotoCount)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-rose-400"
                      >
                        Auto-fill Samples
                    </button>
                  </div>
                </div>

                {/* Drag-and-Drop Native File Input Box */}`;

content = content.replace(oldJsx, newJsx);

fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
