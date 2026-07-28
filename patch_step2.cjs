const fs = require('fs');
let content = fs.readFileSync('src/components/CustomizerStudio.tsx', 'utf8');

const oldJsx = `          {/* STEP 2: CUSTOM MESSAGES & SPEECH-TO-TEXT POEM */}
          {activeStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Type className="w-5 h-5 text-rose-500" />
                <span>Write or Dictate Your Heartfelt Poem</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Paragraph Message
                </label>
                <textarea
                  rows={3}
                  value={customization.customParagraph}
                  onChange={(e) => updateField('customParagraph', e.target.value)}
                  placeholder="Thank you for being the most incredible person in my life..."
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* SPEECH RECOGNITION POEM RECORDER */}
              <SpeechPoemRecorder
                currentPoemText={customization.customPoem}
                onTranscribed={(text) => updateField('customPoem', text)}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Surprise Poem / Verse (Edit or Type)
                </label>
                <textarea
                  rows={5}
                  value={customization.customPoem}
                  onChange={(e) => updateField('customPoem', e.target.value)}
                  placeholder="Roses are red, violets are blue..."
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 font-serif leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center space-x-2"
                >
                  <span>Next: Add Memory Photos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}`;

const newJsx = `          {/* STEP 2: TEMPLATE SPECIFIC FEATURES */}
          {activeStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Type className="w-5 h-5 text-rose-500" />
                <span>{selectedTemplate?.title.split(' ')[0]} Specific Features</span>
              </h3>
              
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900/50 mb-6">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                  We've tailored these customization options specifically for the <strong>{selectedTemplate?.title}</strong> template you chose.
                </p>
              </div>

              {/* DYNAMIC FIELDS BASED ON TEMPLATE */}
              
              {selectedTemplate?.id === 'romantic-love-story' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-500" /> Secret Passcode Lock
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">They will need to enter this code to unlock the love letter.</p>
                    <input
                      type="text"
                      value={customization.secretPasscode}
                      onChange={(e) => updateField('secretPasscode', e.target.value)}
                      placeholder="e.g. 2024, LOVE, ANNIVERSARY"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hidden Love Letter Paragraph
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Thank you for being the most incredible person in my life..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              )}

              {selectedTemplate?.id === 'birthday-confetti-party' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Birthday Wishes Message
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2">This will be displayed on the main party wall.</p>
                    <textarea
                      rows={3}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Wishing you the happiest of birthdays!"
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Explosive Confetti on Load</h4>
                      <p className="text-xs text-slate-500">Blast confetti as soon as they open the link</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={customization.confettiOnLoad !== false}
                        onChange={(e) => updateField('confettiOnLoad', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {['bestie-chaos-polaroid', 'sisterhood-gratitude-tree', 'celestial-galaxy', 'retro-90s-arcade', 'minimalist-editorial', 'vintage-parchment'].includes(selectedTemplate?.id || '') && (
                 <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {selectedTemplate?.id === 'celestial-galaxy' ? 'Shooting Star Wish Message' : 'Custom Personal Message'}
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Type your heartfelt message here..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                 </div>
              )}

              {/* POEM / DICTATION IS ONLY FOR CERTAIN TEMPLATES LIKE VINTAGE OR EDITORIAL */}
              {['vintage-parchment', 'minimalist-editorial'].includes(selectedTemplate?.id || '') && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Add a Voice-Dictated Poem</h4>
                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />
                  <textarea
                    rows={4}
                    value={customization.customPoem}
                    onChange={(e) => updateField('customPoem', e.target.value)}
                    placeholder="Roses are red, violets are blue..."
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 font-serif"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center space-x-2"
                >
                  <span>Next: Add Memory Photos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}`;

// Now we need to remove the passcode block from Step 4, since it's now in Step 2.
const oldPasscodeJsx = `              {/* Password Protection Toggle */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                    <span>Require Passcode to View</span>
                  </h4>
                  <p className="text-xs text-slate-500">Only people with the code can view this</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={customization.enablePasscode}
                    onChange={(e) => updateField('enablePasscode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {customization.enablePasscode && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Secret Passcode *
                  </label>
                  <input
                    type="text"
                    value={customization.secretPasscode}
                    onChange={(e) => updateField('secretPasscode', e.target.value)}
                    placeholder="e.g. 2024, LOVE, BESTIE"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}`;


if (content.includes("STEP 2: CUSTOM MESSAGES & SPEECH-TO-TEXT POEM")) {
  content = content.replace(oldJsx, newJsx);
  content = content.replace(oldPasscodeJsx, "");
  fs.writeFileSync('src/components/CustomizerStudio.tsx', content);
  console.log("Replaced Step 2 and removed Passcode from Step 4");
} else {
  console.log("Could not find the target code to replace.");
}
