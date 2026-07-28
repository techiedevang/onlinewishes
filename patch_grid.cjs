const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

const oldGridHtml = `<div \n                       key={index} \n                       className={\`group relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 \${mem ? 'border-transparent' : 'border-dashed border-slate-300 dark:border-slate-700'} flex flex-col items-center justify-center\`}
                    >
                      {mem ? (
                        <>
                          <SafeImage 
                            src={mem.imageUrl} 
                            alt={\`Slot \${index + 1}\`} 
                            fallbackUrl={mem.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300'}
                            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                            style={{
                              objectFit: mem.objectFit || 'cover',
                              objectPosition: mem.objectPosition || 'center',
                              filter: mem.filter === 'vintage' ? 'sepia(0.5) hue-rotate(-30deg) contrast(1.2)' : mem.filter === 'sepia' ? 'sepia(1)' : mem.filter === 'grayscale' ? 'grayscale(1)' : mem.filter === 'contrast' ? 'contrast(1.5)' : 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-black/40 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            
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

                            <div className="z-20">
                              <input
                                type="text"
                                value={mem.caption}
                                onChange={(e) => {
                                  const updated = [...customization.memories];
                                  updated[index] = { ...updated[index], caption: e.target.value };
                                  updateField('memories', updated);
                                }}
                                className="w-full bg-black/60 text-white text-[10px] px-2 py-1 rounded-md border border-white/20 focus:outline-none focus:border-white"
                                placeholder="Caption..."
                              />
                            </div>
                          </div>
                          
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-bold backdrop-blur-sm pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity">
                            #{index + 1}
                          </div>
                        </>
                      ) : (`;

const newGridHtml = `<div 
                       key={index} 
                       className={\`group relative w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 \${mem ? 'border-transparent pb-1' : 'aspect-square border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center'}\`}
                    >
                      {mem ? (
                        <div className="flex flex-col h-full">
                          <div className="relative w-full aspect-square overflow-hidden bg-black rounded-t-lg">
                            <SafeImage 
                              src={mem.imageUrl} 
                              alt={\`Slot \${index + 1}\`} 
                              fallbackUrl={mem.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300'}
                              className="w-full h-full transition-transform duration-500"
                              style={{
                                objectFit: mem.objectFit || 'cover',
                                objectPosition: mem.objectPosition || 'center',
                                filter: mem.filter === 'vintage' ? 'sepia(0.5) hue-rotate(-30deg) contrast(1.2)' : mem.filter === 'sepia' ? 'sepia(1)' : mem.filter === 'grayscale' ? 'grayscale(1)' : mem.filter === 'contrast' ? 'contrast(1.5)' : 'none'
                              }}
                            />
                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-black/40 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1 w-20">
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
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-bold backdrop-blur-sm pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity">
                              #{index + 1}
                            </div>
                          </div>
                          <div className="px-1.5 py-1.5 bg-white dark:bg-slate-800 flex-1 flex flex-col justify-end">
                            <input
                              type="text"
                              value={mem.caption}
                              onChange={(e) => {
                                const updated = [...customization.memories];
                                updated[index] = { ...updated[index], caption: e.target.value };
                                updateField('memories', updated);
                              }}
                              className="w-full bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[10px] px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-rose-400 placeholder:text-slate-400"
                              placeholder="Add short caption..."
                            />
                          </div>
                        </div>
                      ) : (`;

if (content.includes("className={`group relative w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 ${mem ? 'border-transparent' : 'border-dashed border-slate-300 dark:border-slate-700'} flex flex-col items-center justify-center`}")) {
  content = content.replace(oldGridHtml, newGridHtml);
  fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
  console.log("Success");
} else {
  console.log("Could not find the target string.");
}
