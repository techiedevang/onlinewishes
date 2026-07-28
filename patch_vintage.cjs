const fs = require('fs');
let content = fs.readFileSync('src/components/InteractiveSurpriseTemplate.tsx', 'utf8');

const oldVintageLetterRegex = /\{\/\* NEW STAGE: VINTAGE LETTER \*\/\}[\s\S]*?Unfold Memories\n                  <\/button>\n                <\/div>\n              <\/div>\n            <\/motion\.div>\n          \}/;

const newVintageUI = `
          {/* NEW STAGE: VINTAGE LETTER */}
          {stage === 'vintage_letter' && (
            <motion.div
              key="vintage_letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-stone-900 z-20 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')] mix-blend-overlay"></div>
              
              <motion.div 
                initial={{ y: 50, rotate: 2 }}
                animate={{ y: 0, rotate: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="bg-[#f4ebd8] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-xl w-full relative border border-[#e6d5b8] transform rotate-1"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
              >
                {/* Antique Wax Seal */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#8B0000] rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(139,0,0,0.5)] rotate-12 border-2 border-[#5c0000] z-10" style={{ backgroundImage: 'radial-gradient(circle, #a11, #8B0000)' }}>
                  <div className="w-12 h-12 rounded-full border border-[#5c0000] flex items-center justify-center opacity-80">
                    <span className="text-[#ffcccc] text-2xl font-serif italic drop-shadow-md" style={{ fontFamily: '"Great Vibes", cursive' }}>S</span>
                  </div>
                </div>

                {/* Pressed botanical graphic top left */}
                <div className="absolute -top-8 -left-8 w-32 h-32 opacity-80 -rotate-12 pointer-events-none mix-blend-multiply">
                  <img src="https://images.unsplash.com/photo-1603484466540-84382cc1b9da?auto=format&fit=crop&q=80&w=200&h=200" className="object-cover rounded-full filter sepia contrast-150 saturate-50" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }} alt="pressed leaf" />
                </div>

                <h2 className="text-4xl text-[#5c4033] mb-8" style={{ fontFamily: '"Homemade Apple", cursive' }}>Dearest {customization.recipientName},</h2>
                
                <p className="text-xl text-[#4a3b32] leading-relaxed mb-10 text-justify" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.6rem' }}>
                  {customization.customParagraph || "Through the sands of time, our memories remain as beautiful as the day they were made. Like pressed flowers in an old book, I've gathered our most cherished moments here, preserved forever."}
                </p>
                
                <div className="text-right">
                  <p className="text-3xl text-[#5c4033] font-bold signature-font" style={{ fontFamily: '"Homemade Apple", cursive' }}>{customization.senderName}</p>
                </div>
                
                <div className="mt-16 flex justify-center relative z-10">
                  <button
                    onClick={handleNextStage}
                    className="px-10 py-3 bg-transparent text-[#5c4033] border border-[#5c4033] font-serif italic text-lg hover:bg-[#5c4033] hover:text-[#f4ebd8] transition-all"
                  >
                    Unfold Memories
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* NEW STAGE: VINTAGE BOTANICAL GALLERY */}
          {stage === 'vintage_botanical_gallery' && (
            <motion.div
              key="vintage_botanical_gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col p-6 md:p-12 bg-[#e8e0cc] z-20 overflow-y-auto"
              style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
            >
              <div className="w-full max-w-5xl mx-auto pt-8 pb-24">
                <div className="text-center mb-16">
                  <h2 className="text-5xl md:text-6xl text-[#5c4033] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                    The Archive
                  </h2>
                  <div className="w-24 h-[1px] bg-[#8c7b6d] mx-auto my-6"></div>
                  <p className="text-[#8c7b6d] font-serif italic text-xl">Botanical specimens & captured light.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                  {customization.memories.slice(0, 4).map((mem, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, rotate: (i % 2 === 0 ? -2 : 3) }}
                      whileInView={{ opacity: 1, rotate: (i % 2 === 0 ? -1 : 1) }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: i * 0.2, duration: 1 }}
                      className="bg-[#f4ebd8] p-4 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative border border-[#d6c5a8]"
                    >
                      {/* Tape corners */}
                      <div className="absolute -top-3 -left-3 w-12 h-6 bg-amber-900/20 rotate-[-45deg] shadow-sm backdrop-blur-[1px]"></div>
                      <div className="absolute -bottom-3 -right-3 w-12 h-6 bg-amber-900/20 rotate-[-45deg] shadow-sm backdrop-blur-[1px]"></div>

                      <div className="relative overflow-hidden group aspect-[4/3] border border-[#d6c5a8] p-1 bg-[#fffdf9]">
                        <SafeImage 
                          src={mem.imageUrl} 
                          fallbackUrl={mem.fallbackUrl} 
                          className="w-full h-full object-cover filter sepia-[0.3] contrast-[1.1] brightness-[0.95] group-hover:sepia-0 transition-all duration-700" 
                          alt="vintage memory" 
                        />
                        {/* Overlay texture on image */}
                        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")' }}></div>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <p className="text-[#5c4033] text-xl" style={{ fontFamily: '"Caveat", cursive' }}>
                          {mem.caption || \`Exhibit No. \${i+1}\`}
                        </p>
                      </div>

                      {/* Pressed flower graphic (alternating) */}
                      {i % 2 === 1 && (
                        <div className="absolute -bottom-10 -left-6 w-24 h-24 opacity-60 pointer-events-none mix-blend-multiply rotate-45">
                          <img src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=200&h=200" className="object-cover rounded-full filter sepia contrast-150 saturate-50" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} alt="pressed flower" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-24 flex justify-center">
                  <button
                    onClick={handleNextStage}
                    className="px-10 py-3 bg-[#5c4033] text-[#f4ebd8] font-serif italic text-xl shadow-[0_5px_15px_rgba(92,64,51,0.4)] hover:bg-[#4a332a] transition-colors border border-[#3d2a23]"
                  >
                    Open the Scrapbook
                  </button>
                </div>
              </div>
            </motion.div>
          )}
`;

content = content.replace(oldVintageLetterRegex, newVintageUI.trim());
fs.writeFileSync('src/components/InteractiveSurpriseTemplate.tsx', content);
