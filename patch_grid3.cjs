const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

const regex = /<div className="absolute inset-0 bg-gradient-to-t from-slate-900\/80 via-black\/40 to-black\/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1\.5">([\s\S]*?)<\/div>\s*<div className="absolute bottom-1 right-1 px-1\.5 py-0\.5 bg-black\/60 text-white text-\[9px\] rounded font-bold backdrop-blur-sm pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity">/g;

let match = regex.exec(content);
if (match) {
    const newInner = `
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1 w-20">
                                {/* Object Fit */}
                                <select 
                                  value={mem.objectFit || 'cover'} 
                                  onChange={(e) => {
                                    const updated = [...customization.memories];
                                    updated[index] = { ...updated[index], objectFit: e.target.value as any };
                                    updateField('memories', updated);
                                  }}
                                  className="bg-black/70 text-[9px] text-white rounded border border-white/20 p-0.5 outline-none"
                                >
                                  <option value="cover">Fill</option>
                                  <option value="contain">Fit</option>
                                </select>
                                
                                {/* Filter */}
                                <select 
                                  value={mem.filter || 'none'} 
                                  onChange={(e) => {
                                    const updated = [...customization.memories];
                                    updated[index] = { ...updated[index], filter: e.target.value };
                                    updateField('memories', updated);
                                  }}
                                  className="bg-black/70 text-[9px] text-white rounded border border-white/20 p-0.5 outline-none"
                                >
                                  <option value="none">No Filter</option>
                                  <option value="vintage">Vintage</option>
                                  <option value="sepia">Sepia</option>
                                  <option value="grayscale">B&W</option>
                                  <option value="contrast">Contrast</option>
                                </select>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleRemoveMemory(mem.id)}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600 shadow-md z-20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-slate-50 dark:bg-slate-800 p-1.5 border-t border-slate-200 dark:border-slate-700">
                             <input
                                type="text"
                                value={mem.caption}
                                onChange={(e) => {
                                  const updated = [...customization.memories];
                                  updated[index] = { ...updated[index], caption: e.target.value };
                                  updateField('memories', updated);
                                }}
                                className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-rose-400 placeholder:text-slate-400"
                                placeholder="Add caption..."
                              />
                          </div>
                          
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-bold backdrop-blur-sm pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity">`;
                          
    content = content.replace(match[0], `<div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-black/40 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">` + newInner);
    fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
    console.log("Success");
} else {
    console.log("Failed");
}
