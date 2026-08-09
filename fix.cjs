const fs = require('fs');

// Fix templates.ts
let content = fs.readFileSync('src/data/templates.ts', 'utf8');
const searchString = "  // === VALENTINE WEEK TEMPLATES ===";

let startIndex = content.indexOf(searchString);
if (startIndex !== -1) {
  let endOfReviewArray = content.indexOf('];', startIndex);
  let movedContent = content.substring(startIndex, endOfReviewArray);
  
  // Remove movedContent from reviews array
  content = content.substring(0, startIndex) + content.substring(endOfReviewArray);
  
  // Find end of TEMPLATES array and insert movedContent
  let lastBracket = content.lastIndexOf('];');
  content = content.substring(0, lastBracket) + movedContent + '\n];' + content.substring(lastBracket + 2);
  fs.writeFileSync('src/data/templates.ts', content);
  console.log('Fixed templates.ts');
}

// Fix templates views
const viewFiles = [
  'src/components/templates/FriendshipBondView.tsx',
  'src/components/templates/ProposeDayView.tsx',
  'src/components/templates/RoseDayView.tsx',
  'src/components/templates/ValentineDayView.tsx'
];

viewFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let viewContent = fs.readFileSync(file, 'utf8');
    viewContent = viewContent.replace(/fallbackSrc=/g, 'fallbackUrl=');
    viewContent = viewContent.replace(/<SafeImage \n?\s*src={mem.imageUrl}/g, '<SafeImage src={mem.imageUrl} fallbackUrl={mem.fallbackUrl || mem.imageUrl}');
    fs.writeFileSync(file, viewContent);
    console.log('Fixed ' + file);
  }
});
