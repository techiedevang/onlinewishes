import React, { useState, useEffect, useLayoutEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { User, UserCustomization, Template, CustomAiBlueprint } from './types';
import { auth, db } from './lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { TEMPLATES, INITIAL_MEMORIES_21, getDefaultCustomization } from './data/templates';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { TemplateGallery } from './components/TemplateGallery';
import { CustomizerStudio } from './components/CustomizerStudio';
import { PricingSection } from './components/PricingSection';
import { LivePreviewModal } from './components/LivePreviewModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { TemplateReviewsModal } from './components/TemplateReviewsModal';
import { CustomAiIdeaModal } from './components/CustomAiIdeaModal';
import { ContactAndNewsletter } from './components/ContactAndNewsletter';
import { Footer } from './components/Footer';
import { PolicyModal, PolicyTab } from './components/PolicyModal';
import { UserDashboard } from './components/UserDashboard';
import { OfflineBanner } from './components/OfflineBanner';
import { SparkleParticleCanvas } from './components/SparkleParticleCanvas';
import { GoogleAd } from './components/GoogleAd';
import { updatePageMetadata, updateMetadataForTemplate } from './utils/seo';
import { Check, Sparkles, ExternalLink, Share2, Facebook, Twitter, MessageCircle, Link, Lock, XCircle, Heart, Instagram } from 'lucide-react';
import { loadScrapbookFromCloud } from './lib/scrapbookService';
import { InteractiveSurpriseTemplate } from './components/InteractiveSurpriseTemplate';
import { ErrorBoundary } from './components/ErrorBoundary';

// Scroll Entrance Animation Wrapper Component
function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [rawActiveTab, setRawActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('onlinewishes_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved user:', e);
    }
    return null;
  });

  const setActiveTab = (newTab: string) => {
    setRawActiveTab(newTab);
    if (!window.location.pathname.startsWith('/p/')) {
      window.history.pushState({ tab: newTab }, "", `#${newTab}`);
      window.scrollTo(0, 0);
    }
  };

  const activeTab = rawActiveTab;

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [reviewTemplate, setReviewTemplate] = useState<Template | null>(null);
  const [showCustomAiModal, setShowCustomAiModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');
  const [showUserDashboard, setShowUserDashboard] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab | null>(null);
  const [publishedToast, setPublishedToast] = useState<{ show: boolean; link: string } | null>(null);

  useEffect(() => {
    if (window.location.pathname.startsWith('/p/')) return;
    
    // Initialize hash based on state if missing
    if (!window.location.hash) {
      window.history.replaceState({ tab: rawActiveTab }, "", `#${rawActiveTab}`);
    } else {
      const initialTab = window.location.hash.replace('#', '');
      if (initialTab) {
        setRawActiveTab(initialTab);
        window.history.replaceState({ tab: initialTab }, "", window.location.hash);
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      // If any modal is open, close it, and DON'T change the tab.
      if (previewTemplate || reviewTemplate || showCustomAiModal || showAuthModal || showUserDashboard || showAdminDashboard || policyTab) {
        setPreviewTemplate(null);
        setReviewTemplate(null);
        setShowCustomAiModal(false);
        setShowAuthModal(false);
        setShowUserDashboard(false);
        setShowAdminDashboard(false);
        setPolicyTab(null);
        // Push the current tab state back to keep history intact.
        window.history.pushState({ tab: rawActiveTab }, "", `#${rawActiveTab}`);
        return;
      }

      if (e.state && e.state.tab) {
        setRawActiveTab(e.state.tab);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          setRawActiveTab(hash);
        } else {
          setRawActiveTab('home');
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [rawActiveTab, previewTemplate, reviewTemplate, showCustomAiModal, showAuthModal, showUserDashboard, showAdminDashboard, policyTab]);

  // Direct Scrapbook Loading States
  const [publishedScrapbook, setPublishedScrapbook] = useState<UserCustomization | null>(null);
  const [isScrapbookLoading, setIsScrapbookLoading] = useState<boolean>(false);
  const [scrapbookError, setScrapbookError] = useState<string | null>(null);
  const [isPasscodeLocked, setIsPasscodeLocked] = useState<boolean>(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState<string>('');

  const loadSlug = async (slug: string, passcode?: string) => {
    setIsScrapbookLoading(true);
    setScrapbookError(null);
    try {
      const result = await loadScrapbookFromCloud(slug, passcode);
      if (result) {
        if (result.isLocked) {
          setIsPasscodeLocked(true);
          if (passcode) {
            setScrapbookError('Incorrect passcode. Please try again.');
          }
        } else if (result.customization) {
          setPublishedScrapbook(result.customization);
          setIsPasscodeLocked(false);
          setScrapbookError(null);
        }
      } else {
        setScrapbookError('Surprise scrapbook page not found.');
      }
    } catch (e) {
      console.error(e);
      setScrapbookError('Failed to load surprise page.');
    } finally {
      setIsScrapbookLoading(false);
    }
  };

  const handleUnlockPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const path = window.location.pathname;
    let slug = '';
    if (path.startsWith('/p/')) {
      slug = path.split('/p/')[1];
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      slug = searchParams.get('p') || searchParams.get('id') || searchParams.get('subdomain') || '';
    }
    if (slug) {
      loadSlug(slug.trim(), passcodeAttempt);
    }
  };

  // Direct loading on mount
  useEffect(() => {
    const path = window.location.pathname;
    let slug = '';
    
    if (path.startsWith('/p/')) {
      slug = path.split('/p/')[1];
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      slug = searchParams.get('p') || searchParams.get('id') || searchParams.get('subdomain') || '';
    }

    if (slug && slug.trim() !== '' && slug !== 'admin') {
      loadSlug(slug.trim());
    }
  }, []);

  // Global Auth State Synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'user';
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            role = docSnap.data().role || 'user';
          }
        } catch (e) {
          console.error('Failed to fetch user role:', e);
        }

        const authenticatedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Valued User',
          email: firebaseUser.email || 'user@example.com',
          role: role as 'user' | 'admin',
          mfaEnabled: false,
        };
        setCurrentUser(authenticatedUser);
        localStorage.setItem('onlinewishes_current_user', JSON.stringify(authenticatedUser));
      } else {
        setCurrentUser(null);
        localStorage.removeItem('onlinewishes_current_user');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Failed to sign out:', e);
    }
    localStorage.removeItem('onlinewishes_current_user');
    setCurrentUser(null);
    setShowUserDashboard(false);
    setShowAdminDashboard(false);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  // Check for /admin route
  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      setShowAdminDashboard(true);
    }
  }, []);

  const handleOpenAdmin = () => {
    setShowAdminDashboard(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleCloseAdmin = () => {
    setShowAdminDashboard(false);
    if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
      window.history.pushState({}, '', '/');
    }
  };

  // Customization state
  const [customization, setCustomization] = useState<UserCustomization>(() => {
    try {
      const saved = localStorage.getItem('onlinewishes_customization_draft');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse localStorage draft:', e);
    }
    return {
      recipientName: 'Sarah',
      relationship: 'bestie',
      senderName: 'Alex',
      occasion: 'bestie',
      primaryColor: '#ec4899',
      bgTheme: 'pink',
      musicTrack: 'acoustic_love',
      memories: INITIAL_MEMORIES_21,
      customPoem: `Through sunny days and stormy weather,
We laugh and navigate together.
Memories preserved in gold,
A story forever to be told.`,
      customParagraph: `Thank you for being the most incredible person in my life. Every laugh, every memory, every late night talk with you is a gift I cherish forever.`,
      secretPasscode: '2024',
      enablePasscode: false,
      subdomain: 'sarah-bestie-surprise',
      targetDate: '2026-12-31',
      counterTitle: 'Every Second With You',
      groupWishes: [
        { id: '1', name: 'Alex', msg: "Happy Birthday! You're the absolute best!", color: 'bg-pink-100 border-pink-300' },
        { id: '2', name: 'The Whole Crew', msg: "We wouldn't miss this for the world. Have an amazing year ahead!", color: 'bg-blue-100 border-blue-300' },
        { id: '3', name: 'Jessica & Sam', msg: "Keep shining bright! Can't wait for our next trip! ✨", color: 'bg-yellow-100 border-yellow-300' },
        { id: '4', name: 'Your Bestie', msg: "I brought the cake but I ate it. Sorry! Love you! 🎂", color: 'bg-purple-100 border-purple-300' },
      ],
      quizQuestion: 'Are we actually soulmates?',
      quizOptions: [
        'A. We share the exact same brain cell 🧠',
        'B. Unhinged voice notes at 3 AM 🔊',
        'C. "Don\'t tell anyone, but..." 🤫'
      ],
      quizBadgeText: '10/10 CHAOS DUO 🏆',
      insideJokes: [
        { id: '1', title: 'VOICE NOTE #1', caption: 'That one unhinged 3AM moment we never speak of' },
        { id: '2', title: 'VOICE NOTE #2', caption: 'When we tried cooking and almost called the fire department' },
      ],
      timelineEvents: [
        { id: '1', year: '2021', title: 'First Meeting', description: 'When we accidentally wore matching outfits and instantly clicked' },
        { id: '2', year: '2022', title: 'Epic Road Trip', description: '300 miles of endless singing, terrible gas station snacks, and lost maps' },
        { id: '3', year: '2024', title: 'Late Night Talks', description: 'Solving all world problems over lukewarm coffee' },
      ],
      sisterhoodPromises: [
        'I promise to always be your safe space.',
        'I promise to keep your secrets and share your joys.',
        'I promise that no matter how much we grow, we will always be sisters first.'
      ],
      gratitudeReasons: [
        'For always having my back, no matter what.',
        'For the late night talks and endless laughter.',
        'For understanding me without needing words.',
        'For being my first and forever friend.'
      ],
      arcadeGamerTag: 'SARAH',
      arcadeMissionName: 'BESTIE SURPRISE QUEST',
      arcadeHighScore: '999,999',
      shootingStarWishText: 'May you always find your guiding star in the darkest nights, and may your brightest dreams come true.',
    };
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dynamic SEO Metadata updates
  useLayoutEffect(() => {
    if (publishedScrapbook) {
      updatePageMetadata({
        title: `${publishedScrapbook.recipientName}'s Custom Surprise Scrapbook`,
        description: `Open this beautiful surprise scrapbook created with love for ${publishedScrapbook.recipientName} by ${publishedScrapbook.senderName || 'their friend'} on OnlineWishes.`,
        ogTitle: `A Surprise for ${publishedScrapbook.recipientName}! ❤️`,
        ogDescription: `Created by ${publishedScrapbook.senderName || 'their friend'} for ${publishedScrapbook.recipientName}. Open to unwrap the memories and messages!`,
        ogImage: publishedScrapbook.ogImageUrl || (publishedScrapbook.memories && publishedScrapbook.memories.length > 0 ? publishedScrapbook.memories[0].imageUrl : undefined),
        canonicalUrl: `https://onlinewishes.in/p/${publishedScrapbook.subdomain}`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": `${publishedScrapbook.recipientName}'s Custom Surprise Scrapbook`,
          "description": `Surprise scrapbook created for ${publishedScrapbook.recipientName}.`,
          "url": `https://onlinewishes.in/p/${publishedScrapbook.subdomain}`,
          "publisher": {
            "@type": "Organization",
            "name": "OnlineWishes",
            "logo": {
              "@type": "ImageObject",
              "url": "https://onlinewishes.in/favicon.svg"
            }
          }
        }
      });
    } else if (previewTemplate) {
      updateMetadataForTemplate(previewTemplate.title, previewTemplate.category, previewTemplate.description, previewTemplate.thumbnail);
    } else if (activeTab === 'customizer') {
      updatePageMetadata({
        title: `Customizing ${customization.recipientName}'s Surprise Page`,
        description: `Personalize photos, custom love letters, background music, and secret passcode for ${customization.recipientName} on OnlineWishes.`,
      });
    } else if (showAdminDashboard) {
      updatePageMetadata({
        title: 'Admin Dashboard',
        description: 'OnlineWishes administration dashboard and user management.',
      });
    } else {
      updatePageMetadata(); // Default homepage metadata
    }
  }, [activeTab, previewTemplate, customization.recipientName, showAdminDashboard, publishedScrapbook]);

  const handleSelectTemplateToBuild = (template: Template) => {
    let sound = 'rainy_cafe';
    if (template.id === 'romantic-love-story') sound = 'romantic_piano';
    else if (template.id === 'celestial-galaxy') sound = 'stargazing_night';
    else if (template.id === 'vintage-parchment') sound = 'library_whispers';
    else if (template.id === 'birthday-confetti-party') sound = 'birthday_light';
    else if (template.id === 'retro-90s-arcade') sound = 'arcade_8bit';
    else if (template.id === 'minimalist-editorial') sound = 'library_whispers';

    // Clear old localStorage draft when choosing a template so it starts fresh
    try {
      localStorage.removeItem('onlinewishes_customization_draft');
    } catch (e) {
      console.error('Failed to clear draft on template select:', e);
    }
    
    const freshDefaults = getDefaultCustomization(template.id);
    setCustomization({
      ...freshDefaults,
      bgTheme: template.id,
      occasion: template.category,
      ambientSoundscape: sound,
      enablePasscode: template.id === 'romantic-love-story' ? true : false,
    });
    setActiveTab('customizer');
    const elem = document.getElementById('customizer');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyAiBlueprint = (blueprint: CustomAiBlueprint, customData: UserCustomization) => {
    setCustomization(customData);
    setActiveTab('customizer');
    const elem = document.getElementById('customizer');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const triggerPublishConfetti = () => {
    // Primary burst
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    });

    // Side cannon bursts
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.7 },
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.7 },
      });
    }, 250);
  };

  const handlePublishWebsite = () => {
    triggerPublishConfetti();
    const generatedUrl = `https://onlinewishes.in/p/${customization.subdomain || 'bestie-surprise'}`;
    setPublishedToast({
      show: true,
      link: generatedUrl,
    });
  };

  // Standalone Direct URL Loading Views
  if (isScrapbookLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white">
        <SparkleParticleCanvas isFullScreen={true} particleDensity={1.2} />
        <div className="relative flex flex-col items-center space-y-4 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/30 animate-pulse">
            <Heart className="w-8 h-8 text-rose-500 animate-ping" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Unwrapping Your Surprise...</h2>
          <p className="text-xs text-slate-400 max-w-xs">Connecting to OnlineWishes Cloud to retrieve this beautiful custom gift scrapbook.</p>
        </div>
      </div>
    );
  }

  if (isPasscodeLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <SparkleParticleCanvas isFullScreen={true} particleDensity={1.0} />
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Secret Passcode Protected</h2>
            <p className="text-xs text-slate-400">This surprise is encrypted for privacy. Please enter the passcode to open.</p>
          </div>

          <form onSubmit={handleUnlockPasscode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Enter secret passcode</label>
              <input
                type="password"
                required
                placeholder="••••"
                value={passcodeAttempt}
                onChange={(e) => setPasscodeAttempt(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl font-bold tracking-widest text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {scrapbookError && (
              <p className="text-xs text-rose-400 text-center font-semibold">{scrapbookError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98 uppercase tracking-wider"
            >
              Unlock Surprise
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center">Powered by OnlineWishes.in End-to-End Encryption</p>
        </div>
      </div>
    );
  }

  if (scrapbookError) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <SparkleParticleCanvas isFullScreen={true} particleDensity={0.8} />
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold">Failed to Load Surprise</h2>
            <p className="text-xs text-slate-400">{scrapbookError}</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Visit Homepage
          </button>
        </div>
      </div>
    );
  }

  if (publishedScrapbook) {
    return (
      <ErrorBoundary>
        <div className="w-full h-[100dvh]">
          <InteractiveSurpriseTemplate
            key={`${publishedScrapbook.subdomain}-${publishedScrapbook.bgTheme}`}
            customization={publishedScrapbook}
            isStandaloneView={true}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className={`min-h-screen max-w-full overflow-x-hidden bg-white dark:bg-zinc-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans relative ${darkMode ? 'dark' : ''}`}>
      
      {/* Immersive Global Background Photo Wallpaper for Dark Mode */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-0 dark:opacity-20 pointer-events-none -z-30 transition-opacity duration-700 filter saturate-125"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=2400&q=85')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950/95 via-zinc-950/90 to-zinc-950/95 opacity-0 dark:opacity-100 pointer-events-none -z-25 transition-opacity duration-700" />
      
      {/* Interactive Canvas Sparkle Overlay on Hover / Touch / Scroll */}
      <SparkleParticleCanvas isFullScreen={true} particleDensity={1.0} />

      {/* Offline Banner Detection */}
      <OfflineBanner />

      {/* Persistent Navigation Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('signin')}
        onOpenUserDashboard={() => setShowUserDashboard(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenCustomAiModal={() => setShowCustomAiModal(true)}
      />

      {/* Main Container Views */}
      <main>
        {activeTab === 'home' && (
          <>
            <AnimatedSection>
              <HeroSection
                onExploreTemplates={() => {
                  setActiveTab('templates');
                  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenCustomizer={() => setActiveTab('customizer')}
                onTrySamplePreview={() => setPreviewTemplate(TEMPLATES[0])}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <TemplateGallery
                onPreviewTemplate={(tpl) => setPreviewTemplate(tpl)}
                onSelectTemplateToBuild={handleSelectTemplateToBuild}
                onOpenReviewsModal={(tpl) => setReviewTemplate(tpl)}
                onOpenCustomAiModal={() => setShowCustomAiModal(true)}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <PricingSection
                onSelectTemplateToBuild={handleSelectTemplateToBuild}
                onOpenCustomAiModal={() => setShowCustomAiModal(true)}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <ContactAndNewsletter />
            </AnimatedSection>
          </>
        )}

        {activeTab === 'templates' && (
          <AnimatedSection className="pt-4">
            <TemplateGallery
              onPreviewTemplate={(tpl) => setPreviewTemplate(tpl)}
              onSelectTemplateToBuild={handleSelectTemplateToBuild}
              onOpenReviewsModal={(tpl) => setReviewTemplate(tpl)}
              onOpenCustomAiModal={() => setShowCustomAiModal(true)}
            />
          </AnimatedSection>
        )}

        {activeTab === 'customizer' && (
          <AnimatedSection>
            <CustomizerStudio
              currentUser={currentUser}
              customization={customization}
              onChangeCustomization={setCustomization}
              onOpenLivePreview={() => {
                const currentTpl = TEMPLATES.find(t => t.id === customization.bgTheme) || TEMPLATES[0];
                setPreviewTemplate(currentTpl);
              }}
              onPublish={handlePublishWebsite}
              onOpenAuth={handleOpenAuth}
            />
          </AnimatedSection>
        )}

        {activeTab === 'pricing' && (
          <AnimatedSection>
            <PricingSection
              onSelectTemplateToBuild={handleSelectTemplateToBuild}
              onOpenCustomAiModal={() => setShowCustomAiModal(true)}
            />
          </AnimatedSection>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={handleOpenAdmin}
        onOpenPolicy={(tab) => setPolicyTab(tab)}
      />

      {/* POLICY & LEGAL MODAL */}
      {policyTab && (
        <PolicyModal
          initialTab={policyTab}
          onClose={() => setPolicyTab(null)}
        />
      )}

      {/* MODAL 1: LIVE INTERACTIVE TEMPLATE PREVIEW MODAL */}
      {previewTemplate && (
        <LivePreviewModal
          template={previewTemplate}
          customization={customization}
          onClose={() => setPreviewTemplate(null)}
          onCustomizeThis={() => {
            let sound = 'rainy_cafe';
            if (previewTemplate.id === 'romantic-love-story') sound = 'romantic_piano';
            else if (previewTemplate.id === 'celestial-galaxy') sound = 'stargazing_night';
            else if (previewTemplate.id === 'vintage-parchment') sound = 'library_whispers';
            else if (previewTemplate.id === 'birthday-confetti-party') sound = 'birthday_light';
            else if (previewTemplate.id === 'retro-90s-arcade') sound = 'arcade_8bit';
            else if (previewTemplate.id === 'minimalist-editorial') sound = 'library_whispers';
            
            setCustomization(prev => ({ ...prev, bgTheme: previewTemplate.id, occasion: previewTemplate.category, ambientSoundscape: sound, enablePasscode: previewTemplate.id === 'romantic-love-story' ? true : false, secretPasscode: previewTemplate.id === 'romantic-love-story' ? '2024' : prev.secretPasscode }));
            setPreviewTemplate(null);
            setActiveTab('customizer');
          }}
        />
      )}

      {/* MODAL 2: TEMPLATE REVIEWS MODAL */}
      {reviewTemplate && (
        <TemplateReviewsModal
          template={reviewTemplate}
          onClose={() => setReviewTemplate(null)}
        />
      )}

      {/* MODAL 3: CUSTOM AI IDEA ARCHITECT MODAL */}
      {showCustomAiModal && (
        <CustomAiIdeaModal
          onClose={() => setShowCustomAiModal(false)}
          onApplyBlueprint={handleApplyAiBlueprint}
        />
      )}

      {/* MODAL 4: USER AUTH & MFA MODAL */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          initialMode={authInitialMode}
          onLogin={(user) => {
            localStorage.setItem('onlinewishes_current_user', JSON.stringify(user));
            setCurrentUser(user);
          }}
          onLogout={handleLogout}
          onClose={() => setShowAuthModal(false)}
          onOpenDashboard={() => setShowUserDashboard(true)}
        />
      )}

      {/* MODAL: USER PROFILE & PURCHASES DASHBOARD */}
      {showUserDashboard && currentUser && (
        <UserDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onClose={() => setShowUserDashboard(false)}
          onNewWebsite={() => {
            setActiveTab('customizer');
            setShowUserDashboard(false);
          }}
        />
      )}

      {/* MODAL 5: ADMIN & SYSTEM HEALTH DASHBOARD */}
      {showAdminDashboard && (
        <AdminDashboard
          currentUser={currentUser}
          onLogin={(user) => setCurrentUser(user)}
          onLogout={handleLogout}
          onClose={handleCloseAdmin}
        />
      )}

      {/* PUBLISHED TOAST MODAL */}
      {publishedToast?.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white rounded-2xl p-5 shadow-2xl max-w-sm space-y-3 animate-bounce">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Check className="w-5 h-5" />
            <span>Website Successfully Published! 🎉</span>
          </div>
          <p className="text-xs text-slate-300">
            Your custom surprise website for {customization.recipientName} is now live at:
          </p>
          <a
            href={publishedToast.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs font-mono bg-slate-950 p-2 rounded-lg text-rose-400 underline truncate flex items-center justify-between"
          >
            <span>{publishedToast.link}</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
          
          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 flex items-center space-x-1">
              <Share2 className="w-3 h-3" />
              <span>Share With {customization.recipientName}</span>
            </p>
            <div className="grid grid-cols-5 gap-2">
              <a href={`https://api.whatsapp.com/send?text=I made a surprise website for you! Check it out: ${encodeURIComponent(publishedToast.link)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-[#25D366] hover:bg-[#128C7E] rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm">
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publishedToast.link)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-[#1877F2] hover:bg-[#166FE5] rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm">
                <Facebook className="w-4 h-4 text-white" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publishedToast.link)}&text=I made a surprise website!`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm">
                <Twitter className="w-4 h-4 text-white fill-white" />
              </a>
              <a href="https://instagram.com/onlinewishes.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-2 bg-gradient-to-tr from-yellow-400 via-rose-500 to-fuchsia-600 hover:opacity-90 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm">
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <button onClick={() => { navigator.clipboard.writeText(publishedToast.link); alert('Link copied to clipboard!'); }} className="flex items-center justify-center p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm">
                <Link className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setPublishedToast(null)}
            className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors mt-2"
          >
            Done
          </button>
        </div>
      )}

    </div>
  );
}
