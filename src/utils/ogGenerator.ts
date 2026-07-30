import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserCustomization } from '../types';

/**
 * Generates a dynamic OG Image using HTML5 Canvas API based on the scrapbook's details and active theme.
 * Runs on the client side right before the page is published.
 */
export async function generateOgImage(customization: UserCustomization): Promise<string> {
  const width = 1200;
  const height = 630;

  // Create off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  const theme = customization.bgTheme || 'default';
  const recipient = customization.recipientName || 'Bestie';
  const sender = customization.senderName || 'Your Friend';
  const occasion = customization.occasion || 'special-day';
  const primaryColor = customization.primaryColor || '#ec4899';

  // 1. Draw Background and Theme Elements
  ctx.save();
  if (theme === 'celestial-galaxy') {
    // Starry outer space indigo gradient
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
    grad.addColorStop(0, '#1e1b4b'); // deep indigo
    grad.addColorStop(1, '#020617'); // slate black
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw little stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Draw celestial sparkles
    drawCelestialSparkle(ctx, 150, 150, 15);
    drawCelestialSparkle(ctx, 1050, 480, 25);
    drawCelestialSparkle(ctx, 950, 120, 10);
  } else if (theme === 'romantic-love-story') {
    // Warm rose/red romantic gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#ffe4e6'); // rose-100
    grad.addColorStop(1, '#f43f5e'); // rose-500
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw floating love hearts
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 40 + 20;
      drawHeart(ctx, x, y, size);
    }
  } else if (theme === 'vintage-parchment') {
    // Sepia/beige paper textured background
    ctx.fillStyle = '#f5f2eb';
    ctx.fillRect(0, 0, width, height);

    // Vignette / Aged border
    const grad = ctx.createRadialGradient(width / 2, height / 2, 300, width / 2, height / 2, 600);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0)');
    grad.addColorStop(1, 'rgba(120, 53, 4, 0.15)'); // warm amber vignette
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Classic double lines border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(25, 25, width - 50, height - 50);
    ctx.strokeRect(32, 32, width - 64, height - 64);
  } else if (theme === 'retro-90s-arcade') {
    // Dark cyber grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw retro grid
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)'; // hot pink lines
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (theme === 'birthday-confetti-party') {
    // Cute light pastel pink
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(0, 0, width, height);

    // Draw confetti sprinkles
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 10 + 5;
      const type = Math.random();
      ctx.beginPath();
      if (type < 0.4) {
        // Circle confetti
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      } else if (type < 0.7) {
        // Rectangle ribbon
        ctx.rect(x - size / 2, y - size / 4, size, size / 2);
      } else {
        // Triangle confetti
        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x + size / 2, y + size / 2);
        ctx.lineTo(x - size / 2, y + size / 2);
        ctx.closePath();
      }
      ctx.fill();
    }
  } else {
    // Default modern premium theme: Light pastel gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Aesthetic soft modern shapes
    ctx.fillStyle = 'rgba(236, 72, 153, 0.04)';
    ctx.beginPath();
    ctx.arc(100, 100, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(59, 130, 246, 0.04)';
    ctx.beginPath();
    ctx.arc(width - 100, height - 100, 300, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Draw Polaroid Photo / Graphic Card
  ctx.save();
  // Set card coordinates
  const cardWidth = 360;
  const cardHeight = 440;
  const cardX = width - cardWidth - 80;
  const cardY = (height - cardHeight) / 2;

  // Add polaroid rotation shadow and card
  ctx.translate(cardX + cardWidth / 2, cardY + cardHeight / 2);
  ctx.rotate((-2 * Math.PI) / 180); // Slight elegant tilt
  ctx.translate(-(cardX + cardWidth / 2), -(cardY + cardHeight / 2));

  // Polaroid Card Shadow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 15;

  // Card Background (pure off-white Polaroid card)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 16);
  ctx.fill();

  // Reset shadow for inner components
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Polaroid Inner Photo Box
  const photoSize = 310;
  const photoX = cardX + 25;
  const photoY = cardY + 25;

  // Draw Photo placeholder or illustration based on theme
  ctx.fillStyle = '#f8fafc';
  if (theme === 'celestial-galaxy') ctx.fillStyle = '#0f172a';
  else if (theme === 'vintage-parchment') ctx.fillStyle = '#fefaf0';
  else if (theme === 'retro-90s-arcade') ctx.fillStyle = '#1e1b4b';
  else if (theme === 'romantic-love-story') ctx.fillStyle = '#fff5f5';

  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  // Draw central vector art illustration in polaroid (completely CORS-safe, beautiful and reliable)
  ctx.save();
  ctx.translate(photoX + photoSize / 2, photoY + photoSize / 2);
  if (theme === 'romantic-love-story') {
    // Beautiful romantic heart
    ctx.fillStyle = '#f43f5e';
    drawHeart(ctx, 0, -10, 110);
    // Draw sparkle
    ctx.fillStyle = '#ffffff';
    drawCelestialSparkle(ctx, 40, -40, 12);
  } else if (theme === 'celestial-galaxy') {
    // Beautiful golden celestial moon & stars
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(18, -12, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fcd34d';
    drawCelestialSparkle(ctx, -35, -25, 12);
    drawCelestialSparkle(ctx, 35, 45, 8);
  } else if (theme === 'vintage-parchment') {
    // Vintage flower/heart symbol
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    drawHeartOutline(ctx, 0, -10, 100);
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'italic 16px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('with love', 0, 50);
  } else if (theme === 'retro-90s-arcade') {
    // Retro 8-bit game heart
    ctx.fillStyle = '#f43f5e';
    drawPixelHeart(ctx, 0, -10, 8);
  } else if (theme === 'birthday-confetti-party') {
    // Big birthday cake or present box illustration
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-45, 10, 90, 50); // cake base
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-35, -15, 70, 25); // cake top tier
    
    // Candles
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-15, -35, 6, 20);
    ctx.fillRect(10, -35, 6, 20);
    
    // Flame
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-12, -40, 4, 0, Math.PI * 2);
    ctx.arc(13, -40, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default lovely envelope illustration
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeRect(-55, -45, 110, 80);
    ctx.beginPath();
    ctx.moveTo(-55, -45);
    ctx.lineTo(0, 0);
    ctx.lineTo(55, -45);
    ctx.stroke();
  }
  ctx.restore();

  // Draw hand-written text at polaroid bottom
  ctx.fillStyle = '#334155';
  if (theme === 'vintage-parchment') {
    ctx.font = 'italic 28px Georgia';
    ctx.fillStyle = '#78350f';
  } else if (theme === 'retro-90s-arcade') {
    ctx.font = '900 24px monospace';
    ctx.fillStyle = '#ec4899';
  } else {
    ctx.font = 'italic 500 26px system-ui, -apple-system, sans-serif';
  }
  ctx.textAlign = 'center';
  ctx.fillText('Open Surprise ✨', cardX + cardWidth / 2, cardY + cardHeight - 35);

  // Draw dynamic tape at top of polaroid card
  ctx.save();
  ctx.translate(cardX + cardWidth / 2, cardY + 5);
  ctx.rotate((5 * Math.PI) / 180);
  ctx.fillStyle = theme === 'vintage-parchment' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(236, 72, 153, 0.3)';
  ctx.fillRect(-60, -15, 120, 30);
  ctx.restore();

  ctx.restore();

  // 3. Draw Left Side Text (Aesthetic Display Typography)
  ctx.save();
  const textX = 80;
  ctx.textAlign = 'left';

  // Eyebrow Label
  ctx.fillStyle = theme === 'celestial-galaxy' ? '#93c5fd' : theme === 'vintage-parchment' ? '#b45309' : theme === 'retro-90s-arcade' ? '#22d3ee' : primaryColor;
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('A SPECIAL SURPRISE scrapBook'.toUpperCase(), textX, 150);

  // Big Greeting Message (The "For Sarah" Display Heading)
  const isDarkBg = theme === 'celestial-galaxy' || theme === 'retro-90s-arcade';
  ctx.fillStyle = isDarkBg ? '#ffffff' : '#0f172a';
  
  if (theme === 'vintage-parchment') {
    ctx.font = '900 68px Georgia, serif';
    ctx.fillStyle = '#451a03';
  } else if (theme === 'retro-90s-arcade') {
    ctx.font = '900 64px monospace';
    ctx.fillStyle = '#f43f5e';
  } else {
    ctx.font = '900 70px system-ui, -apple-system, sans-serif';
  }
  
  ctx.fillText(`For ${recipient}`, textX, 235);

  // Subheader: Occasion & Occasion Description
  ctx.fillStyle = isDarkBg ? '#cbd5e1' : '#475569';
  if (theme === 'vintage-parchment') {
    ctx.font = 'italic 24px Georgia';
    ctx.fillStyle = '#78350f';
  } else {
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
  }
  
  const prettyOccasion = formatOccasion(occasion);
  ctx.fillText(prettyOccasion, textX, 290);

  // Creative custom message
  ctx.fillStyle = isDarkBg ? '#94a3b8' : '#64748b';
  if (theme === 'vintage-parchment') {
    ctx.font = 'italic 18px Georgia';
    ctx.fillStyle = '#92400e';
  } else {
    ctx.font = '400 18px system-ui, -apple-system, sans-serif';
  }
  
  const line1 = `Unwrap a personalized custom scrapbook full of lovely memories,`;
  const line2 = `inside jokes, favorite music, and heart-touching messages.`;
  ctx.fillText(line1, textX, 350);
  ctx.fillText(line2, textX, 380);

  // Author details (Created with love by Alex)
  ctx.fillStyle = isDarkBg ? '#e2e8f0' : '#1e293b';
  ctx.font = theme === 'vintage-parchment' ? 'italic 20px Georgia' : 'bold 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Created with ❤️ by ${sender}`, textX, 450);

  // Bottom Branding & Subdomain details
  ctx.fillStyle = isDarkBg ? '#475569' : '#94a3b8';
  ctx.font = 'bold 14px monospace';
  const customSubdomain = customization.subdomain || 'bestie-surprise';
  ctx.fillText(`onlinewishes.in/p/${customSubdomain}`, textX, 510);

  // Premium Quality seal or heart icon next to branding
  ctx.fillStyle = '#f43f5e';
  drawHeart(ctx, textX + ctx.measureText(`onlinewishes.in/p/${customSubdomain}`).width + 25, 502, 16);

  ctx.restore();

  // Return generated base64 PNG data URL
  return canvas.toDataURL('image/png');
}

/**
 * Saves the generated Base64 OG Image dynamically to the `uploaded_images` collection in Firestore,
 * using a deterministic ID (`og-${subdomain}`) to overwrite old images cleanly.
 */
export async function saveGeneratedOgImage(base64Data: string, subdomain: string): Promise<string> {
  const imageId = `og-${subdomain || `sb_${Date.now()}`}`;
  const docRef = doc(db, 'uploaded_images', imageId);

  try {
    await setDoc(docRef, {
      scrapbookId: subdomain,
      data: base64Data,
      contentType: 'image/png',
      uploadedBy: auth.currentUser?.uid || 'anonymous',
      createdAt: Date.now()
    }, { merge: true });

    return `/api/images/${imageId}`;
  } catch (error) {
    console.error('Failed to save generated OG image in Firestore:', error);
    // fallback directly to the base64 URL or a relative asset
    return base64Data;
  }
}

// Draw a beautiful vector heart
function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  
  // Custom sizing scale
  const scale = size / 50;
  ctx.moveTo(0, -10 * scale);
  
  ctx.bezierCurveTo(15 * scale, -30 * scale, 35 * scale, -10 * scale, 0, 25 * scale);
  ctx.bezierCurveTo(-35 * scale, -10 * scale, -15 * scale, -30 * scale, 0, -10 * scale);
  
  ctx.fill();
  ctx.restore();
}

function drawHeartOutline(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  
  const scale = size / 50;
  ctx.moveTo(0, -10 * scale);
  ctx.bezierCurveTo(15 * scale, -30 * scale, 35 * scale, -10 * scale, 0, 25 * scale);
  ctx.bezierCurveTo(-35 * scale, -10 * scale, -15 * scale, -30 * scale, 0, -10 * scale);
  
  ctx.closePath();
  ctx.restore();
}

// Draw retro pixel 8-bit heart
function drawPixelHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, pixelSize: number) {
  ctx.save();
  // Pixel layout of heart (9x9 grid)
  const grid = [
    [0,1,1,0,0,0,1,1,0],
    [1,1,1,1,0,1,1,1,1],
    [1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,0,0,1,0,0,0,0]
  ];
  const rows = grid.length;
  const cols = grid[0].length;
  const startX = cx - (cols * pixelSize) / 2;
  const startY = cy - (rows * pixelSize) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  ctx.restore();
}

// Draw celestial/golden sparkles
function drawCelestialSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = '#fde047'; // yellow-300
  ctx.moveTo(x, y - radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  ctx.quadraticCurveTo(x, y, x - radius, y);
  ctx.quadraticCurveTo(x, y, x, y - radius);
  ctx.fill();
  ctx.restore();
}

function formatOccasion(occ: string): string {
  const map: Record<string, string> = {
    bestie: 'For My Incredible Best Friend 💖',
    girlfriend: 'With All My Heart & Love 🌹',
    sister: 'For My Dearest Sister 🌸',
    birthday: 'Wishing You A Very Happy Birthday! 🎂',
    anniversary: 'Happy Anniversary to Us! 🥂',
    wedding: 'Congratulations on Your Wedding! 💍',
    friendship: 'Happy Friendship Day! 🤝'
  };
  return map[occ.toLowerCase()] || 'A Beautiful Surprise Just For You! ✨';
}
