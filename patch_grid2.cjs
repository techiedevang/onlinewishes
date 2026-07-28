const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

// Find the start of the grid element and the end of the input field
const startIndex = content.indexOf('<div \n                      key={index} \n                      className={`group relative w-full aspect-square bg-slate-100');
if (startIndex !== -1) {
    // we need to replace it more cleanly. Actually, let's just use regex.
}

// Let's just find the caption input and make sure it is clearly visible.
const captionInputRegex = /<input\s+type="text"\s+value=\{mem\.caption\}[^>]+>/;

const newCaptionInput = `<input
                                type="text"
                                value={mem.caption}
                                onChange={(e) => {
                                  const updated = [...customization.memories];
                                  updated[index] = { ...updated[index], caption: e.target.value };
                                  updateField('memories', updated);
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[10px] px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-rose-400 placeholder:text-slate-400"
                                placeholder="Add short caption..."
                              />`;
                              
content = content.replace(captionInputRegex, newCaptionInput);
fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
