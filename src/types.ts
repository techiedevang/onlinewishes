export interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  fallbackUrl?: string;
  isBig?: boolean;
  filter?: string; // e.g., 'none', 'sepia', 'grayscale', 'vintage', 'contrast', 'bright', 'warm', 'cool'
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPosition?: string;
  rotation?: number; // 0, 90, 180, 270
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  zoom?: number; // 1 to 2.5
}

export type PageData =
  | { type: 'cover' }
  | { type: 'memory'; data: Memory }
  | { type: 'blank' }
  | { type: 'back_cover' };

export interface PhysicalPage {
  front: PageData;
  back: PageData;
}

export interface TemplateReview {
  id: string;
  templateId: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatarUrl?: string;
  verified: boolean;
  recipientType?: string;
}

export interface CustomAiBlueprint {
  title: string;
  conceptDescription: string;
  suggestedThemeColor: string;
  suggestedMusic: string;
  estimatedPrice: number;
  complexityLevel: 'Standard Custom' | 'Advanced Bespoke' | 'VIP Masterpiece';
  features: string[];
  initialPoem: string;
  initialParagraph: string;
}

export type OccasionType = 'bestie' | 'girlfriend' | 'sister' | 'birthday' | 'anniversary' | 'wedding' | 'friendship';

export interface Template {
  id: string;
  title: string;
  category: OccasionType;
  description: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  thumbnail: string;
  features: string[];
  themeColor: string;
  interactivePreviewType: 'box21' | 'love_story' | 'bestie_wall' | 'sister_tree' | 'birthday_party' | 'retro_arcade' | 'galaxy' | 'editorial' | 'vintage' | 'friendship_greet';
  photoCount: number;
  price: number;
  reviews?: TemplateReview[];
}

export interface DigitalSticker {
  id: string;
  stickerId: string;
  emojiOrSvg: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  rotation: number; // degrees
  scale: number;
  pageIndex?: number;
}

export interface GroupWish {
  id: string;
  name: string;
  msg: string;
  color?: string;
}

export interface InsideJoke {
  id: string;
  title: string;
  caption: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface UserCustomization {
  recipientName: string;
  relationship: string;
  senderName: string;
  occasion: OccasionType;
  primaryColor: string;
  bgTheme: string;
  musicTrack: string;
  spotifyTrackUrl?: string;
  spotifyPreviewUrl?: string;
  spotifyTrackName?: string;
  spotifyArtistName?: string;
  ambientSoundscape?: string; // 'rainy_cafe' | 'library_whispers' | 'cozy_fireplace' | 'ocean_breeze' | 'stargazing_night' | 'none'
  placedStickers?: DigitalSticker[];
  memories: Memory[];
  customPoem: string;
  customParagraph: string;
  secretPasscode: string;
  enablePasscode: boolean;
  passcodeHint?: string;
  subdomain: string;
  signatureUrl?: string;
  confettiOnLoad?: boolean;
  ogImageUrl?: string;

  // Template-Specific Interactive Customization Features
  targetDate?: string; // For countdowns & anniversary counters
  counterTitle?: string;
  groupWishes?: GroupWish[];
  quizQuestion?: string;
  quizOptions?: string[];
  quizBadgeText?: string;
  insideJokes?: InsideJoke[];
  timelineEvents?: TimelineEvent[];
  sisterhoodPromises?: string[];
  gratitudeReasons?: string[];
  scratchCardAttachments?: Array<{ photoUrl?: string; sticker?: string }>;
  arcadeGamerTag?: string;
  arcadeMissionName?: string;
  arcadeHighScore?: string;
  shootingStarWishText?: string;

  // Final Completion / Thank You Screen Customization
  finalHeading?: string;
  finalMessage?: string;
  finalImageUrl?: string;
  finalClosingNote?: string;
  finalButtonText?: string;
  finalBgGradient?: string;
}

export interface User {
  createdAt?: string;
  lastLoginAt?: string;
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  mfaEnabled: boolean;
  mfaVerified?: boolean;
  avatarUrl?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userEmail: string;
}

export interface SystemMetric {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  apiLatencyMs: number;
  backupStatus: 'Healthy (Last backup 10m ago)' | 'Syncing' | 'Warning';
  cicdPipeline: 'Success' | 'Running' | 'Failed';
  uptimePercentage: number;
}

export interface SavedProject {
  id: string;
  title: string;
  recipientName: string;
  templateId: string;
  subdomain: string;
  publishedUrl: string;
  createdAt: string;
  status: 'draft' | 'published';
  views: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userEmail: string;
  userName: string;
  amount: number;
  currency: string;
  templateTitle: string;
  paymentGateway: 'Razorpay UPI' | 'PhonePe QR' | 'Credit/Debit Card' | 'NetBanking' | 'Google Pay';
  status: 'SUCCESS' | 'PENDING' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  receiptUrl?: string;
}

export interface CustomWebsiteRequest {
  id: string;
  recipientName: string;
  relationship: string;
  clientPrompt: string;
  audioUrl?: string;
  audioDuration?: number;
  whatsappNumber: string;
  requestedSlug: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CONTACTED';
  createdAt: string;
  userEmail?: string;
  estimatedPrice: number;
  aiBlueprintTitle?: string;
}

export function getMemoryImageStyle(mem: Memory): React.CSSProperties {
  const transform = `rotate(${mem.rotation || 0}deg) ${mem.flipHorizontal ? 'scaleX(-1)' : ''} ${mem.flipVertical ? 'scaleY(-1)' : ''} scale(${mem.zoom || 1})`;
  let filter = 'none';
  if (mem.filter === 'vintage') filter = 'sepia(0.5) hue-rotate(-30deg) contrast(1.2)';
  else if (mem.filter === 'sepia') filter = 'sepia(1)';
  else if (mem.filter === 'grayscale') filter = 'grayscale(1)';
  else if (mem.filter === 'contrast') filter = 'contrast(1.5)';
  else if (mem.filter === 'bright') filter = 'brightness(1.2) contrast(1.1)';
  else if (mem.filter === 'warm') filter = 'sepia(0.3) saturate(1.4)';
  else if (mem.filter === 'cool') filter = 'hue-rotate(180deg) saturate(0.8)';

  return {
    objectFit: mem.objectFit || 'cover',
    objectPosition: mem.objectPosition || 'center',
    transform,
    filter,
  };
}


