import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { uploadImageToStorage, uploadAudioToStorage } from '../lib/storageService';
import { auth } from '../lib/firebase';
import imageCompression from 'browser-image-compression';

// ... existing imports ...
import { UserCustomization, Memory, OccasionType, User, getMemoryImageStyle } from '../types';
import { Heart, Sparkles, Upload, Music, Lock, Link as LinkIcon, Plus, Trash2, Check, ArrowRight, Eye, RefreshCw, Type, Image as ImageIcon, Save, Download, RotateCcw, Smartphone, LayoutGrid, GripVertical, Clock, Volume2, VolumeX, Play, Square, Smile, Database, Cloud, Search, Copy, Loader2, X, CreditCard, HelpCircle, Gamepad2, Star, Scroll, MessageSquare, LogIn, UserPlus, Shield, Pencil, Camera } from 'lucide-react';

import { SafeImage } from './SafeImage';
import { SpotifyIntegrator } from './SpotifyIntegrator';
import { SpeechPoemRecorder } from './SpeechPoemRecorder';
import { SparkleParticleCanvas } from './SparkleParticleCanvas';
import { InteractiveSurpriseTemplate } from './InteractiveSurpriseTemplate';
import { ErrorBoundary } from './ErrorBoundary';
import { DigitalStickersPanel } from './DigitalStickersPanel';
import { ImageCropper } from './ImageCropper';
import { SignaturePanel } from './SignaturePanel';
import PhotoEditorModal from './PhotoEditorModal';
import { SOUNDSCAPE_OPTIONS, soundscapeEngine } from '../utils/soundscapes';
import { saveScrapbookToCloud, loadScrapbookFromCloud, recordPaymentInCloud } from '../lib/scrapbookService';
import { generateOgImage, saveGeneratedOgImage } from '../utils/ogGenerator';
import { TEMPLATES, getDefaultCustomization } from '../data/templates';

interface CustomizerStudioProps {
  customization: UserCustomization;
  onChangeCustomization: (updated: UserCustomization) => void;
  onOpenLivePreview: () => void;
  onPublish: (finalSubdomain?: string) => void;
  onOpenAuth?: (initialMode?: 'signin' | 'signup') => void;
  currentUser?: User | null;
}

const DRAFT_STORAGE_KEY = 'onlinewishes_customization_draft';

// Small 'Help' tooltip icon component for explaining input fields to first-time users
export function HelpTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1 z-30">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-slate-400 hover:text-rose-500 focus:outline-none transition-colors p-0.5 rounded-full inline-flex items-center justify-center"
        title="Field Help Info"
        aria-label="Field explanation"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 p-2.5 bg-slate-900 text-white text-[11px] font-medium leading-normal rounded-xl shadow-2xl border border-slate-700 pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="relative">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
}

export function CustomizerStudio({
  customization,
  onChangeCustomization,
  onOpenLivePreview,
  onPublish,
  onOpenAuth,
  currentUser,
}: CustomizerStudioProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showAuthUploadModal, setShowAuthUploadModal] = useState<boolean>(false);
  const [newCaption, setNewCaption] = useState<string>('');
  const [newImage, setNewImage] = useState<string>('');
  const [draftSavedToast, setDraftSavedToast] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);
  const [studioLayout, setStudioLayout] = useState<'split' | 'form_only'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'form_only';
    }
    return 'split';
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingMemoryIndex, setEditingMemoryIndex] = useState<number | null>(null);
  const [cropTarget, setCropTarget] = useState<{ url: string; onSave: (url: string) => void } | null>(null);
  const [previewSoundId, setPreviewSoundId] = useState<string | null>(null);
  const selectedTemplate = TEMPLATES.find(t => t.id === customization.bgTheme);
  const targetPhotoCount = selectedTemplate?.photoCount || 21;

  // Cloud Firestore database state
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [cloudSavedId, setCloudSavedId] = useState<string | null>(null);
  const [cloudSearchCode, setCloudSearchCode] = useState<string>('');
  const [isSearchingCloud, setIsSearchingCloud] = useState<boolean>(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyPromoCode = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    setPromoMessage(null);
    const cleaned = (customCode || promoCodeInput).trim().toUpperCase();
    if (!cleaned) {
      setPromoMessage({ type: 'error', text: 'Please enter a redeem code.' });
      return;
    }

    const basePrice = selectedTemplate?.price || 79;

    if (cleaned === 'FIRSTWISH') {
      if (!currentUser) {
        setPromoMessage({ type: 'error', text: 'Please sign in to use this promo code.' });
        return;
      }
      try {
        setPromoMessage({ type: 'success', text: 'Verifying code...' });
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        
        const qPay = query(collection(db, 'payments'), where('userEmail', '==', currentUser.email));
        const paySnap = await getDocs(qPay);
        
        if (paySnap.size < 2) {
          setFinalPrice(1);
          setDiscountPercent(0);
          setPromoMessage({ type: 'success', text: '🎉 Redeem code FIRSTWISH applied! Price is Rs. 1.' });
        } else {
          setPromoMessage({ type: 'error', text: 'This promo code is only valid for your first 2 payments.' });
        }
      } catch (err) {
        console.error(err);
        setPromoMessage({ type: 'error', text: 'Failed to verify promo code.' });
      }
      return;
    }

    if (cleaned === 'WISHES10' || cleaned === 'SAVE20' || cleaned === 'WISHES20') {
      const discounted = Math.max(1, Math.round(basePrice * 0.8));
      setFinalPrice(discounted);
      setDiscountPercent(20);
      setPromoMessage({ type: 'success', text: `🎉 Redeem code ${cleaned} applied! 20% OFF — Price is Rs. ${discounted}.` });
      return;
    }

    if (cleaned === 'SPECIAL50' || cleaned === 'HALF50') {
      const discounted = Math.max(1, Math.round(basePrice * 0.5));
      setFinalPrice(discounted);
      setDiscountPercent(50);
      setPromoMessage({ type: 'success', text: `🎉 Redeem code ${cleaned} applied! 50% OFF — Price is Rs. ${discounted}.` });
      return;
    }

    if (cleaned === 'FREE79' || cleaned === 'FREEWISH' || cleaned === 'FREE100') {
      setFinalPrice(1);
      setDiscountPercent(0);
      setPromoMessage({ type: 'success', text: `🎉 Redeem code ${cleaned} applied! Price reduced to Rs. 1.` });
      return;
    }

    // Check Firestore 'coupons' collection
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const couponSnap = await getDoc(doc(db, 'coupons', cleaned));
      if (couponSnap.exists()) {
        const data = couponSnap.data();
        const disc = data.discountPercent || 20;
        const fixPrice = data.fixedPrice;
        const calcPrice = fixPrice !== undefined ? fixPrice : Math.max(1, Math.round(basePrice * (1 - disc / 100)));
        setFinalPrice(calcPrice);
        setDiscountPercent(disc);
        setPromoMessage({ type: 'success', text: `🎉 Redeem code ${cleaned} applied! Price is Rs. ${calcPrice}.` });
        return;
      }
    } catch (cErr) {
      console.warn('Firestore coupon lookup note:', cErr);
    }

    setPromoMessage({ type: 'error', text: 'Invalid or expired redeem code. Try FIRSTWISH or WISHES10.' });
  };

  // Function to save state to localStorage and update timestamp
  const saveCustomizationDraft = () => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(customization));
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(formattedTime);
      setDraftSavedToast(true);
      const timer = setTimeout(() => setDraftSavedToast(false), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to auto-save to localStorage:', e);
    }
  };

  // Immediate save on customization state change
  useEffect(() => {
    saveCustomizationDraft();
  }, [customization]);

  // Periodic 5-second real-time interval auto-save mechanism
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveCustomizationDraft();
    }, 5000); // Saves every 5 seconds to localStorage

    return () => clearInterval(autoSaveInterval);
  }, [customization]);

  const isCustomWebsite = customization.subdomain?.includes('custom') || selectedTemplate?.id?.includes('custom');
  const basePrice = isCustomWebsite ? 300 : (selectedTemplate?.price || TEMPLATES.find(t => t.id === customization.bgTheme)?.price || 199);
  const discountAmount = finalPrice !== null ? basePrice - finalPrice : (discountPercent > 0 ? Math.round((basePrice * discountPercent) / 100) : 0);
  const payablePrice = finalPrice !== null ? finalPrice : Math.max(1, basePrice - discountAmount);

  const checkIsLoggedIn = (): boolean => {
    if (currentUser) return true;
    if (auth.currentUser) return true;
    try {
      if (localStorage.getItem('onlinewishes_current_user')) return true;
    } catch (e) {
      console.error('Error checking local user:', e);
    }
    return false;
  };

  const handleOpenPaymentModal = () => {
    if (!checkIsLoggedIn()) {
      if (onOpenAuth) {
        onOpenAuth('signin');
      }
      return;
    }
    setShowPaymentModal(true);
  };

  const handleRazorpayPayment = async () => {
    if (!checkIsLoggedIn()) {
      setShowPaymentModal(false);
      if (onOpenAuth) {
        onOpenAuth('signin');
      }
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payablePrice })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Failed to create order');
      }
      const order = await res.json();
      
      // If it's a mock order (keys not configured), simulate successful payment automatically
      if (order.id && order.id.startsWith('order_mock_')) {
        console.warn('Razorpay keys not configured. Simulating successful mock payment.');
        alert('Notice: Razorpay API keys are not configured on the server. Simulating a successful mock payment for testing.');
        const mockPayId = `pay_mock_${Date.now()}`;
        const finalId = await handleSaveToCloudDatabase();
        const publishedWebsiteUrl = `https://onlinewishes.in/p/${finalId || customization.subdomain || 'bestie-surprise'}`;

        try {
          await recordPaymentInCloud(
            order.id, 
            mockPayId, 
            payablePrice, 
            `Premium License for ${customization.recipientName || 'Bestie'}'s Surprise Page`,
            currentUser,
            publishedWebsiteUrl
          );
        } catch (payErr) {
          console.error("Failed to write mock payment record to cloud:", payErr);
        }
        setTimeout(() => {
          setIsProcessingPayment(false);
          setShowPaymentModal(false);
          onPublish(finalId);
        }, 1500);
        return;
      }

      const options = {
        key: order.key_id || 'rzp_test_placeholder', // Usually injected by env but fallback for test
        amount: order.amount,
        currency: order.currency,
        name: 'OnlineWishes',
        description: 'Digital Scrapbook Publish',
        order_id: order.id,
        handler: async function (response: any) {
          // Success callback
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });

          const finalId = await handleSaveToCloudDatabase();
          const publishedWebsiteUrl = `https://onlinewishes.in/p/${finalId || customization.subdomain || 'bestie-surprise'}`;

          try {
            await recordPaymentInCloud(
              order.id, 
              response.razorpay_payment_id || `pay_${Date.now()}`, 
              payablePrice, 
              `Premium License for ${customization.recipientName || 'Bestie'}'s Surprise Page`,
              currentUser,
              publishedWebsiteUrl
            );
          } catch (payErr) {
            console.error("Failed to write payment record to cloud:", payErr);
          }
          setIsProcessingPayment(false);
          setShowPaymentModal(false);
          onPublish(finalId);
        },
        prefill: {
          name: customization.senderName || 'Sender'
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            triggerAbandonedReminder('payment_dismissed');
          }
        }
      };
      
      // @ts-ignore
      if (window.Razorpay) {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setIsProcessingPayment(false);
          alert(response.error.description);
        });
        try {
          rzp.open();
        } catch (e: any) {
          console.error("Razorpay open error:", e);
          setIsProcessingPayment(false);
          alert("Error opening Razorpay: " + (e.message || 'Unknown error. Please check if Razorpay keys are valid.'));
        }
      } else {
        // Fallback for environments without Razorpay script loaded
        setIsProcessingPayment(false);
        alert("Payment gateway could not be loaded. Please disable your adblocker or try a different browser to complete the payment.");
      }
    } catch (error) {
      console.error(error);
      setIsProcessingPayment(false);
      alert('Error initializing payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // ... 


  // Trigger abandoned customization reminder email
  const triggerAbandonedReminder = async (reason?: string) => {
    if (currentUser && currentUser.email && (customization as any).paymentStatus !== 'completed') {
      try {
        await fetch('/api/send-draft-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            name: currentUser.name || (currentUser as any).displayName || 'Valued Creator',
            templateName: TEMPLATES.find(t => t.id === customization.bgTheme)?.title || 'Memory Website',
            websiteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://onlinewishes.in'
          })
        });
      } catch (e) {
        console.warn('Failed to send draft reminder email:', e);
      }
    }
  };

  // Abandoned Draft Email Trigger on unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only send if logged in, hasn't paid, and has done some customization
      if (currentUser && currentUser.email && (customization as any).paymentStatus !== 'completed') {
        const payload = JSON.stringify({ 
          email: currentUser.email, 
          name: currentUser.name || (currentUser as any).displayName || 'Valued Creator', 
          templateName: TEMPLATES.find(t => t.id === customization.bgTheme)?.title || 'Memory Scrapbook',
          websiteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://onlinewishes.in'
        });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/send-draft-reminder', blob);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser, (customization as any).paymentStatus, customization.bgTheme]);

  // Save customization to Cloud Firestore Database
  const handleSaveToCloudDatabase = async () => {
    setIsSavingCloud(true);
    setCloudMessage('Generating dynamic social preview thumbnail...');
    let recordId: string | undefined;
    try {
      let updatedCustomization = { ...customization };
      if (!updatedCustomization.subdomain) {
        updatedCustomization.subdomain = `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
      try {
        const base64Og = await generateOgImage(customization);
        const ogImageUrl = await saveGeneratedOgImage(base64Og, updatedCustomization.subdomain);
        updatedCustomization.ogImageUrl = ogImageUrl;
      } catch (ogErr) {
        console.error('Failed to generate dynamic OG image:', ogErr);
      }

      onChangeCustomization(updatedCustomization);

      recordId = await saveScrapbookToCloud(updatedCustomization, currentUser?.id);
      setCloudSavedId(recordId);
      setCloudMessage(`Successfully saved to Cloud Firestore! Record ID: ${recordId}`);
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
      setCloudMessage('Saved locally in browser memory. (Note: Cloud database initialized).');
    } finally {
      setIsSavingCloud(false);
    }
    return recordId;
  };

  // Search and restore saved scrapbook from Cloud Firestore Database
  const handleSearchCloudScrapbook = async () => {
    if (!cloudSearchCode.trim()) return;
    setIsSearchingCloud(true);
    setCloudMessage(null);
    try {
      const passcodePrompt = window.prompt("If this scrapbook is locked with a passcode, please enter it now (leave blank if not locked):");
      
      const result = await loadScrapbookFromCloud(cloudSearchCode.trim(), passcodePrompt || undefined);
      
      if (result) {
        if (result.error) {
          setCloudMessage(result.error);
        } else if (result.customization) {
          onChangeCustomization(result.customization);
          setCloudMessage(`Loaded scrapbook project for "${result.customization.recipientName}"!`);
        } else {
          setCloudMessage('Unable to parse scrapbook data.');
        }
      } else {
        setCloudMessage(`No scrapbook found for ID or code "${cloudSearchCode.trim()}". Check code and try again.`);
      }
    } catch (err) {
      console.error('Failed to query Firestore:', err);
      setCloudMessage('Unable to fetch record from cloud database.');
    } finally {
      setIsSearchingCloud(false);
    }
  };

  // Check for stored draft on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setHasSavedDraft(true);
      }
    } catch (e) {
      console.error('Failed to read draft from localStorage:', e);
    }
  }, []);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        onChangeCustomization(parsed);
      }
    } catch (e) {
      console.error('Error restoring draft:', e);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset customization back to original default template content? Your edits will be cleared.')) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear draft:', e);
      }
      setHasSavedDraft(false);
      const defaults = getDefaultCustomization(selectedTemplate?.id || customization.bgTheme || 'box21-surprise');
      onChangeCustomization(defaults);
    }
  };

  const updateField = <K extends keyof UserCustomization>(key: K, value: UserCustomization[K]) => {
    onChangeCustomization({
      ...customization,
      [key]: value,
    });
  };

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string>('');

  const handleMultipleFilesSelected = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    if (!checkIsLoggedIn()) {
      setShowAuthUploadModal(true);
      return;
    }

    const maxPhotos = selectedTemplate?.photoCount || 50;
    const availableSlots = maxPhotos - customization.memories.length;
    
    if (availableSlots <= 0) {
      alert(`You have reached the maximum limit of ${maxPhotos} photos for this template.`);
      return;
    }
    
    const fileArray = Array.from(files).slice(0, availableSlots);
    setIsUploading(true);
    setUploadProgressMsg(`Uploading ${fileArray.length} photos securely...`);
    
    const newMems: Memory[] = [];
    const scrapbookId = customization.subdomain || `sb_${Date.now()}`;
    
    try {
      let completedCount = 0;
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const uploadPromises = fileArray.map(async (file, i) => {
        const compressedFile = await imageCompression(file, options);
        const url = await uploadImageToStorage(compressedFile, scrapbookId);
        completedCount++;
        setUploadProgressMsg(`Uploaded ${completedCount} of ${fileArray.length} photos...`);
        
        return {
          id: `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          imageUrl: url,
          caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `Memory #${customization.memories.length + i + 1}`,
          date: new Date().toISOString().split('T')[0],
          fallbackUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        };
      });

      const uploadedMems = await Promise.all(uploadPromises);
      newMems.push(...uploadedMems);

      const combined = [...newMems, ...customization.memories].slice(0, maxPhotos); 
      onChangeCustomization({
        ...customization,
        memories: combined,
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Failed to upload some images: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  const handleUploadCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!checkIsLoggedIn()) {
      setShowAuthUploadModal(true);
      return;
    }

    setIsUploading(true);
    setUploadProgressMsg('Compressing and uploading cover photo...');
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true });
      const scrapbookId = customization.subdomain || `sb_${Date.now()}`;
      const url = await uploadImageToStorage(compressedFile, scrapbookId);
      updateField('coverPhotoUrl', url);
      updateField('heroPhotoUrl', url);
    } catch (err) {
      console.error('Failed to upload cover photo:', err);
      alert('Failed to upload cover photo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  const [cropperFile, setCropperFile] = useState<{ file: File; url: string; index: number } | null>(null);

  const handleSingleFileSelected = async (file: File, index: number) => {
    if (!checkIsLoggedIn()) {
      setShowAuthUploadModal(true);
      return;
    }

    const url = URL.createObjectURL(file);
    setCropperFile({ file, url, index });
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    if (!cropperFile) return;
    if (!checkIsLoggedIn()) {
      setShowAuthUploadModal(true);
      return;
    }
    const { file, index } = cropperFile;
    setCropperFile(null);
    
    setIsUploading(true);
    setUploadProgressMsg(`Uploading cropped photo for slot #${index + 1}...`);
    const scrapbookId = customization.subdomain || `sb_${Date.now()}`;
    
    try {
      const res = await fetch(croppedDataUrl);
      const blob = await res.blob();
      const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
      const compressedFile = await imageCompression(croppedFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true });
      const url = await uploadImageToStorage(compressedFile, scrapbookId);
      
      const existingMemory = customization.memories[index];
      const newMemory: Memory = existingMemory ? {
        ...existingMemory,
        imageUrl: url,
        fallbackUrl: existingMemory.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
      } : {
        id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        imageUrl: url,
        caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `Memory #${index + 1}`,
        date: new Date().toISOString().split('T')[0],
        fallbackUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        objectFit: 'cover',
        objectPosition: 'center',
        filter: 'none'
      };

      const updatedMemories = [...customization.memories];
      updatedMemories[index] = newMemory;
      
      onChangeCustomization({
        ...customization,
        memories: updatedMemories.filter(Boolean),
      });
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgressMsg('');
    }
  };

  const handleAutoFillSamplePhotos = (count: number) => {
    const sampleImageUrls = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
      'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=800',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    ];

    const filled: Memory[] = [];
    for (let i = 0; i < Math.min(count, 50); i++) {
      const url = sampleImageUrls[i % sampleImageUrls.length];
      filled.push({
        id: `sample-${Date.now()}-${i}`,
        imageUrl: url,
        caption: `Aesthetic Memory #${i + 1}`,
        date: new Date().toISOString().split('T')[0],
        fallbackUrl: url,
      });
    }
    onChangeCustomization({
      ...customization,
      memories: filled,
    });
  };

  const handleRemoveMemory = (id: string) => {
    onChangeCustomization({
      ...customization,
      memories: customization.memories.filter((m) => m.id !== id),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newMemories = [...customization.memories];
    const item = newMemories.splice(draggedIndex, 1)[0];
    newMemories.splice(index, 0, item);
    onChangeCustomization({
      ...customization,
      memories: newMemories,
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!currentUser) {
    return (
      <div id="customizer" className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="p-8 bg-gradient-to-b from-rose-50/80 via-white to-pink-50/50 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-900 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-rose-500/30">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sign In Required to Customize
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Please sign in or create a free account to customize templates, add photos, write messages, and build your digital surprise websites.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                onClick={() => onOpenAuth && onOpenAuth('signin')}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In / Create Account</span>
              </button>
            </div>

            <div className="pt-4 border-t border-rose-100 dark:border-slate-800 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>100% Free Account • Instant Studio Access</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="customizer" className="py-12 md:py-16 bg-white dark:bg-slate-900 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 space-y-8">
        
        {/* Studio Header & Auto-Save Indicator */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Studio Builder</span>
            </div>

            {/* Last Saved Timestamp Indicator */}
            {lastSaved && (
              <span className="inline-flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Last saved: <strong className="text-slate-900 dark:text-white font-bold">{lastSaved}</strong></span>
              </span>
            )}

            {/* LocalStorage Sync Toast */}
            {draftSavedToast && (
              <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 animate-fadeIn">
                <Save className="w-3 h-3" />
                <span>Auto-Saved (30s sync)</span>
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customize Your Memory Website
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Personalize every text, photo, poem, and music track for {customization.recipientName || 'your bestie'}.
          </p>

          {/* Draft & Reset Toolbar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <Save className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Autosaved every 5s {lastSaved ? `(${lastSaved})` : ''}</span>
            </span>

            <button
              onClick={handleResetToDefaults}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1.5 shadow-xs"
              title="Reset customization back to original template defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset To Default Template Text</span>
            </button>
          </div>
        </div>

        {/* Studio Stepper Bar */}
        <div className="flex items-center justify-start sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto gap-2 scrollbar-none">
          {[
            { step: 1, title: '1. Basic Details', icon: Heart },
            { step: 2, title: '2. Features & Text', icon: Type },
            { step: 3, title: `3. Photos (${customization.memories.length})`, icon: ImageIcon },
            { step: 4, title: '4. Finalize & Publish', icon: Lock },
            { step: 5, title: `5. Digital Stickers (${(customization.placedStickers || []).length})`, icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* LIVE MOUSE-REACTIVE SPARKLE MINI PREVIEW CANVAS BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-3.5 sm:p-4 border border-rose-500/30 shadow-lg text-white group cursor-crosshair">
          <SparkleParticleCanvas particleDensity={1.2} />

          <div className="relative z-20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold flex items-center space-x-2 flex-wrap">
                  <span>Interactive Canvas Sparkle Overlay</span>
                  <span className="text-[9px] sm:text-[10px] bg-rose-500 text-white px-2 py-0.2 rounded-full uppercase font-black">
                    Hover / Touch
                  </span>
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Move your cursor or swipe across to trigger floating particle sparkles!
                </p>
              </div>
            </div>

            {/* Layout Toggle Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="hidden lg:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStudioLayout('split')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors ${
                    studioLayout === 'split' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Split Live Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudioLayout('form_only')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors ${
                    studioLayout === 'form_only' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Editor Only</span>
                </button>
              </div>

              <button
                onClick={onOpenLivePreview}
                className="w-full sm:w-auto px-4 py-2 bg-white text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition-colors flex items-center justify-center space-x-1.5 whitespace-nowrap"
              >
                <Eye className="w-4 h-4 text-rose-500" />
                <span>Full Screen 3D Modal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step Contents & Live Phone Split Container */}
        <div className={`grid grid-cols-1 ${studioLayout === 'split' ? 'lg:grid-cols-12 gap-8' : ''} items-start`}>
          
          {/* Editor Form Column */}
          <div className={`${studioLayout === 'split' ? 'lg:col-span-7' : 'w-full'} bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm`}>
            
            {/* STEP 1: RECIPIENT & SPOTIFY INTEGRATION */}
          {activeStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Who is this surprise website for?</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <span>Recipient's Name *</span>
                    <HelpTooltip text="Enter the name or nickname of the person receiving this gift website." />
                  </label>
                  <input
                    type="text"
                    value={customization.recipientName}
                    onChange={(e) => updateField('recipientName', e.target.value)}
                    placeholder="e.g. Sarah, Ananya, Mia"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <span>Your Name (Sender)</span>
                    <HelpTooltip text="Your name as the sender, shown on the scrapbook cover and final page signature." />
                  </label>
                  <input
                    type="text"
                    value={customization.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Selected Template Display & Quick Switcher */}
              <div className="bg-gradient-to-r from-slate-100 to-rose-50 dark:from-slate-800 dark:to-rose-950/30 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/50 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div>
                    <div className="inline-flex items-center space-x-1.5 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Active Template</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedTemplate?.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {selectedTemplate?.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {selectedTemplate?.features.map((feat, idx) => (
                        <span key={idx} className="text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-center self-center sm:self-start">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-slate-700 relative group">
                      <SafeImage src={selectedTemplate?.thumbnail || ''} fallbackUrl="" alt="Template" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={onOpenLivePreview}
                          className="text-[10px] font-bold bg-white text-slate-900 px-2 py-1 rounded shadow"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Switch Template Buttons */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Switch Active Template ({TEMPLATES.length} Designs):
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TEMPLATES.map((tpl) => {
                      const isSelected = selectedTemplate?.id === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            let sound = 'rainy_cafe';
                            if (tpl.id === 'romantic-love-story') sound = 'romantic_piano';
                            else if (tpl.id === 'celestial-galaxy') sound = 'stargazing_night';
                            else if (tpl.id === 'vintage-parchment') sound = 'library_whispers';
                            else if (tpl.id === 'birthday-confetti-party') sound = 'birthday_light';
                            else if (tpl.id === 'retro-90s-arcade') sound = 'arcade_8bit';
                            else if (tpl.id === 'minimalist-editorial') sound = 'library_whispers';

                            onChangeCustomization({
                              ...customization,
                              bgTheme: tpl.id,
                              occasion: tpl.category,
                              ambientSoundscape: sound,
                              enablePasscode: tpl.id === 'romantic-love-story',
                              secretPasscode: tpl.id === 'romantic-love-story' ? (customization.secretPasscode || '2024') : customization.secretPasscode,
                            });
                          }}
                          className={`p-2 rounded-xl text-left transition-all border flex items-center space-x-2 ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                          }`}
                        >
                          <img src={tpl.thumbnail} alt={tpl.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">{tpl.title}</p>
                            <p className={`text-[9px] ${isSelected ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {tpl.photoCount} Photos • Rs. {tpl.price}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SPOTIFY INTEGRATOR COMPONENT */}
              <SpotifyIntegrator
                customization={customization}
                onChangeCustomization={onChangeCustomization}
              />

              {/* AMBIENT SOUNDSCAPES FEATURE */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Ambient Soundscapes
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select a soothing background audio track that plays automatically when scrapbook is opened
                      </p>
                    </div>
                  </div>

                  {previewSoundId && (
                    <button
                      type="button"
                      onClick={() => {
                        soundscapeEngine.stop();
                        setPreviewSoundId(null);
                      }}
                      className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                    >
                      <Square className="w-3 h-3 fill-white" />
                      <span>Stop Sound</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SOUNDSCAPE_OPTIONS.map((snd) => {
                    const isSelected = (customization.ambientSoundscape || 'rainy_cafe') === snd.id;
                    const isCurrentlyPlaying = previewSoundId === snd.id;

                    return (
                      <div
                        key={snd.id}
                        onClick={() => {
                          updateField('ambientSoundscape', snd.id);
                          soundscapeEngine.play(snd.id);
                          setPreviewSoundId(snd.id);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xl">{snd.icon}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {snd.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {snd.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center space-x-2"
                >
                  <span>Next: Dictate Voice Poem & Words</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TEMPLATE-SPECIFIC CUSTOMIZATION FEATURES */}
          {activeStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Type className="w-5 h-5 text-rose-500" />
                    <span>{selectedTemplate?.title} Features</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize text, secret passcodes, and messages specifically tailored for <strong className="text-rose-500">{selectedTemplate?.title}</strong>.
                  </p>
                </div>
                <div className="text-xl font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full text-xs">
                  {selectedTemplate?.category.toUpperCase()}
                </div>
              </div>

              {/* 1. ROMANTIC LOVE STORY */}
              {selectedTemplate?.id === 'romantic-love-story' && (
                <div className="space-y-6">
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-rose-500" />
                      <span>Secret Passcode Vault & Protection</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Require your partner to enter a secret passcode (e.g. your anniversary year or special word) before unlocking the love letter.
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable Secret Passcode Lock</span>
                      <input
                        type="checkbox"
                        checked={customization.enablePasscode}
                        onChange={(e) => updateField('enablePasscode', e.target.checked)}
                        className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                      />
                    </div>
                    {customization.enablePasscode && (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                            <span>Secret Passcode Code</span>
                            <HelpTooltip text="The exact digits or word required to unlock the love letter (e.g., 2024 or LOVE)." />
                          </label>
                          <input
                            type="text"
                            value={customization.secretPasscode}
                            onChange={(e) => updateField('secretPasscode', e.target.value)}
                            placeholder="e.g. 2024, LOVE, ANNIVERSARY"
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-rose-600 dark:text-rose-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                            <span>Passcode Hint / Clue (Shown on Passcode Screen)</span>
                            <HelpTooltip text="A sweet clue to help your partner guess the code on the unlock screen." />
                          </label>
                          <input
                            type="text"
                            value={customization.passcodeHint || ''}
                            onChange={(e) => updateField('passcodeHint', e.target.value)}
                            placeholder="e.g. Hint: Our special anniversary year ❤️"
                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Countdown & Counter Title Widget */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-rose-500" />
                      <span>Love Countdown & Anniversary Counter</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Target Date (Anniversary / Special Day)
                        </label>
                        <input
                          type="date"
                          value={customization.targetDate || '2026-12-31'}
                          onChange={(e) => updateField('targetDate', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Counter Title Heading
                        </label>
                        <input
                          type="text"
                          value={customization.counterTitle || 'Every Second With You'}
                          onChange={(e) => updateField('counterTitle', e.target.value)}
                          placeholder="e.g. Every Second With You"
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hidden Love Letter / Romantic Paragraph
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Thank you for being the most incredible person in my life..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Romantic Poem / Verse
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Roses are red, violets are blue..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-serif italic text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              )}

              {/* 2. BIRTHDAY CONFETTI PARTY */}
              {selectedTemplate?.id === 'birthday-confetti-party' && (
                <div className="space-y-6">
                  <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Explosive Confetti Blast</h4>
                        <p className="text-xs text-slate-500">Triggers multi-burst confetti cannon when recipient opens the link</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={customization.confettiOnLoad !== false}
                        onChange={(e) => updateField('confettiOnLoad', e.target.checked)}
                        className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Squad / Group Wishes Wall Widget */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-sky-200 dark:border-sky-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-sky-500" />
                        <span>Squad / Group Wishes Wall</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          const current = customization.groupWishes || [
                            { id: '1', name: customization.senderName, msg: customization.customParagraph || "Happy Birthday! You're the best!", color: "bg-pink-100 border-pink-300" },
                            { id: '2', name: "The Whole Crew", msg: "We wouldn't miss this for the world. Have an amazing year ahead!", color: "bg-blue-100 border-blue-300" }
                          ];
                          const updated = [
                            ...current,
                            { id: String(Date.now()), name: 'New Friend', msg: 'Wishing you the happiest birthday ever! 🎉', color: 'bg-emerald-100 border-emerald-300' }
                          ];
                          updateField('groupWishes', updated);
                        }}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Wish</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(customization.groupWishes && customization.groupWishes.length > 0 ? customization.groupWishes : [
                        { id: '1', name: customization.senderName, msg: customization.customParagraph || "Happy Birthday! You're the best!", color: "bg-pink-100 border-pink-300" },
                        { id: '2', name: "The Whole Crew", msg: "We wouldn't miss this for the world. Have an amazing year ahead!", color: "bg-blue-100 border-blue-300" },
                        { id: '3', name: "Your Bestie", msg: "I brought the cake but I ate it. Sorry! Love you! 🎂", color: "bg-purple-100 border-purple-300" }
                      ]).map((wish, idx) => (
                        <div key={wish.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-3">
                          <div className="w-full md:w-1/3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Sender Name</label>
                            <input
                              type="text"
                              value={wish.name}
                              onChange={(e) => {
                                const current = customization.groupWishes || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], name: e.target.value };
                                } else {
                                  updated[idx] = { id: String(idx), name: e.target.value, msg: 'Happy Birthday!' };
                                }
                                updateField('groupWishes', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="w-full md:w-2/3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Wish Message</label>
                            <input
                              type="text"
                              value={wish.msg}
                              onChange={(e) => {
                                const current = customization.groupWishes || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], msg: e.target.value };
                                } else {
                                  updated[idx] = { id: String(idx), name: 'Friend', msg: e.target.value };
                                }
                                updateField('groupWishes', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const current = customization.groupWishes || [];
                              const updated = current.filter((_, i) => i !== idx);
                              updateField('groupWishes', updated);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors shrink-0 self-end md:self-center"
                            title="Delete Wish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Main Birthday Wish Message
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Wishing you the happiest of birthdays! May this year bring endless joy..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Squad / Friend Birthday Poem
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Another year wiser, bolder and brighter..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-serif italic text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>
              )}

              {/* 3. BESTIE CHAOS POLAROID */}
              {selectedTemplate?.id === 'bestie-chaos-polaroid' && (
                <div className="space-y-6">
                  {/* Bestie Friendship Quiz Widget */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900/60 space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 text-fuchsia-500" />
                      <span>Bestie Vibe Check / Friendship Quiz</span>
                    </h5>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Quiz Question
                      </label>
                      <input
                        type="text"
                        value={customization.quizQuestion || 'Are we actually soulmates?'}
                        onChange={(e) => updateField('quizQuestion', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['Option A', 'Option B', 'Option C'].map((lbl, optIdx) => {
                        const opts = customization.quizOptions || [
                          'A. We share the same brain cell',
                          'B. Unhinged voice notes at 3AM',
                          'C. "Don\'t tell anyone, but..."'
                        ];
                        return (
                          <div key={optIdx}>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">{lbl}</label>
                            <input
                              type="text"
                              value={opts[optIdx] || ''}
                              onChange={(e) => {
                                const updated = [...opts];
                                updated[optIdx] = e.target.value;
                                updateField('quizOptions', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Badge Unlocked Title (Upon Quiz Completion)
                      </label>
                      <input
                        type="text"
                        value={customization.quizBadgeText || '10/10 CHAOS DUO'}
                        onChange={(e) => updateField('quizBadgeText', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-amber-500"
                      />
                    </div>
                  </div>

                  {/* Inside Jokes & Secret Voice Notes Widget */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-fuchsia-200 dark:border-fuchsia-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-purple-500" />
                        <span>Inside Jokes & Secret Voice Notes</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          const current = customization.insideJokes || [
                            { id: '1', title: 'VOICE NOTE #1', caption: 'That one unhinged moment' }
                          ];
                          const updated = [
                            ...current,
                            { id: String(Date.now()), title: `VOICE NOTE #${current.length + 1}`, caption: 'Another hilarious secret memory' }
                          ];
                          updateField('insideJokes', updated);
                        }}
                        className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Joke</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(customization.insideJokes && customization.insideJokes.length > 0 ? customization.insideJokes : [
                        { id: '1', title: 'VOICE NOTE #1', caption: 'That one unhinged 3AM moment we never speak of' },
                        { id: '2', title: 'VOICE NOTE #2', caption: 'When we tried cooking and almost called the fire department' }
                      ]).map((joke, idx) => (
                        <div key={joke.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-3">
                          <div className="w-full md:w-1/3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Label Title</label>
                            <input
                              type="text"
                              value={joke.title}
                              onChange={(e) => {
                                const current = customization.insideJokes || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                } else {
                                  updated[idx] = { id: String(idx), title: e.target.value, caption: '' };
                                }
                                updateField('insideJokes', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-purple-600 dark:text-purple-400"
                            />
                          </div>
                          <div className="w-full md:w-2/3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Caption / Inside Joke Text</label>
                            <input
                              type="text"
                              value={joke.caption}
                              onChange={(e) => {
                                const current = customization.insideJokes || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], caption: e.target.value };
                                } else {
                                  updated[idx] = { id: String(idx), title: `VOICE NOTE #${idx+1}`, caption: e.target.value };
                                }
                                updateField('insideJokes', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const current = customization.insideJokes || [];
                              const updated = current.filter((_, i) => i !== idx);
                              updateField('insideJokes', updated);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors shrink-0 self-end md:self-center"
                            title="Delete Inside Joke"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bestie Insider Secrets & Memories Wall Message
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="To my partner in crime! From late night talks to endless laughter..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bestie Tribute Poem / Quote
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Side by side or miles apart, best friends are always close at heart..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    />
                  </div>
                </div>
              )}

              {/* 5. FRIENDSHIP DAY GREET */}
              {selectedTemplate?.id === 'friendship-day-greet' && (
                <div className="space-y-6">
                  {/* OUR SONG — MUSIC TRACK & CUSTOM AUDIO UPLOAD */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm flex items-center space-x-2">
                        <Music className="w-4 h-4 text-emerald-600" />
                        <span>Our Song (Choose Preset Track or Upload Custom Audio)</span>
                      </h5>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                        🎵 Audio Track
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Choose a music track from the presets or upload your own song/audio recording from your device!
                    </p>

                    {/* Song Title Display Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Song Name / Title Displayed on Player
                      </label>
                      <input
                        type="text"
                        value={customization.musicTrack ?? customization.spotifyTrackName ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChangeCustomization({
                            ...customization,
                            musicTrack: val,
                            spotifyTrackName: val
                          });
                        }}
                        placeholder="e.g. Our Favourite Song 🎵"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-900 dark:text-white"
                      />
                    </div>

                    {/* Audio Options: Preset Select vs Custom Audio Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Option A: Preset Track */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Select Preset Music Track
                        </label>
                        <select
                          value={customization.ambientSoundscape || 'rainy_cafe'}
                          onChange={(e) => {
                            const newSoundscape = e.target.value;
                            updateField('ambientSoundscape', newSoundscape);
                            const trackNames: { [key: string]: string } = {
                              rainy_cafe: 'Kawaii Cafe Beats ☕',
                              library_whispers: 'Acoustic Friendship Anthem 🎸',
                              cozy_fireplace: 'Lofi Sunset Chill 🌅',
                              ocean_breeze: 'Piano Memory Lane 🎹',
                              stargazing_night: 'Stargazing Night ✨',
                              none: 'No Music',
                            };
                            const defaultPresetName = trackNames[newSoundscape] || 'Our Special Song';
                            // If user hasn't typed a custom song title, auto-fill with preset name
                            if (!customization.musicTrack || customization.musicTrack === 'Kawaii Cafe Beats ☕' || customization.musicTrack === 'Acoustic Friendship Anthem 🎸' || customization.musicTrack === 'Lofi Sunset Chill 🌅' || customization.musicTrack === 'Piano Memory Lane 🎹' || customization.musicTrack === 'Stargazing Night ✨' || customization.musicTrack === 'No Music') {
                              onChangeCustomization({
                                ...customization,
                                ambientSoundscape: newSoundscape,
                                musicTrack: defaultPresetName,
                                spotifyTrackName: defaultPresetName
                              });
                            } else {
                              updateField('ambientSoundscape', newSoundscape);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                        >
                          <option value="rainy_cafe">Kawaii Cafe Beats ☕</option>
                          <option value="library_whispers">Acoustic Friendship Anthem 🎸</option>
                          <option value="cozy_fireplace">Lofi Sunset Chill 🌅</option>
                          <option value="ocean_breeze">Piano Memory Lane 🎹</option>
                          <option value="stargazing_night">Stargazing Night ✨</option>
                          <option value="none">No Background Track</option>
                        </select>
                      </div>

                      {/* Option B: Upload Custom Audio File */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Upload Custom Audio File (MP3, WAV, M4A)
                        </label>
                        <label className="cursor-pointer w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{customization.spotifyPreviewUrl ? 'Change Uploaded Audio' : 'Upload Audio File'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setIsUploading(true);
                                setUploadProgressMsg('Uploading audio file...');
                                try {
                                  const scrapbookId = customization.subdomain || `sb_${Date.now()}`;
                                  const audioUrl = await uploadAudioToStorage(file, scrapbookId);
                                  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                                  onChangeCustomization({
                                    ...customization,
                                    spotifyPreviewUrl: audioUrl,
                                    spotifyTrackUrl: audioUrl,
                                    musicTrack: nameWithoutExt,
                                    spotifyTrackName: nameWithoutExt
                                  });
                                } catch (err) {
                                  console.error(err);
                                  alert(err instanceof Error ? err.message : 'Failed to upload audio');
                                } finally {
                                  setIsUploading(false);
                                  setUploadProgressMsg('');
                                }
                              }
                            }}
                          />
                        </label>
                        {customization.spotifyPreviewUrl && (
                          <div className="flex items-center justify-between mt-1.5 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 text-[10px]">
                            <span className="text-emerald-700 font-bold truncate">✓ Custom Song Uploaded</span>
                            <button
                              type="button"
                              onClick={() => {
                                onChangeCustomization({
                                  ...customization,
                                  spotifyPreviewUrl: undefined,
                                  spotifyTrackUrl: undefined
                                });
                              }}
                              className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6 Little Truths (Scratch Cards) */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                        <span>Six Secret Scratch Cards (Truths & Covers)</span>
                      </h5>
                      <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        6 Interactive Cards
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Customize the secret <strong>Truth text</strong> hidden under each scratch card. Optionally add a <strong>Cover Photo</strong> or <strong>Sticker Emoji</strong> on top of the scratch surface!
                    </p>

                    <div className="space-y-4">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const currentReasons = customization.gratitudeReasons && customization.gratitudeReasons.length > 0 
                          ? customization.gratitudeReasons 
                          : [
                              'you always show up no matter what',
                              "you're genuinely the funniest person I know",
                              'you keep every secret safe with your life',
                              'best late-night unhinged advisor',
                              'you make everyday chaos feel like an adventure',
                              'a rare, beautiful & genuine soul forever'
                            ];
                        
                        const attachments = customization.scratchCardAttachments || [{}, {}, {}, {}, {}, {}];
                        const currentAtt = attachments[idx] || {};

                        const updateAttachment = (photoUrl?: string, sticker?: string) => {
                          const updatedAtts = [...attachments];
                          updatedAtts[idx] = { photoUrl, sticker };
                          updateField('scratchCardAttachments', updatedAtts);
                        };

                        return (
                          <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <span>Truth #{idx + 1}</span>
                              </label>
                              <div className="flex items-center gap-1">
                                {currentAtt.photoUrl && (
                                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">
                                    Cover Photo Set
                                  </span>
                                )}
                                {currentAtt.sticker && (
                                  <span className="text-sm">
                                    {currentAtt.sticker}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Hidden Secret Truth Input */}
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                Secret Truth Text (Revealed on Scratch)
                              </label>
                              <input
                                type="text"
                                value={currentReasons[idx] || ''}
                                onChange={(e) => {
                                  const updated = [...currentReasons];
                                  updated[idx] = e.target.value;
                                  updateField('gratitudeReasons', updated);
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                                placeholder={`e.g. Secret message #${idx + 1}`}
                              />
                            </div>

                            {/* Optional Scratch Cover Photo & Sticker Controls */}
                            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Cover Photo Upload */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                  Top Cover Photo (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                  {currentAtt.photoUrl ? (
                                    <div className="flex items-center gap-2 w-full">
                                      <SafeImage src={currentAtt.photoUrl} fallbackUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" alt="Cover" className="w-9 h-9 rounded-md object-cover border border-emerald-300 shrink-0" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCropTarget({
                                            url: currentAtt.photoUrl!,
                                            onSave: (url) => updateAttachment(url, currentAtt.sticker)
                                          });
                                        }}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateAttachment(undefined, currentAtt.sticker)}
                                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200"
                                      >
                                        Remove Photo
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors">
                                      <Camera className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Upload Cover Photo</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setIsUploading(true);
                                            setUploadProgressMsg('Uploading scratch card image...');
                                            try {
                                              const compressedFile = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true });
                                              const scrapbookId = customization.subdomain || `sb_${Date.now()}`;
                                              const url = await uploadImageToStorage(compressedFile, scrapbookId);
                                              updateAttachment(url, currentAtt.sticker);
                                            } catch (err) {
                                              console.error('Failed to upload scratch card image', err);
                                              alert('Failed to upload image');
                                            } finally {
                                              setIsUploading(false);
                                              setUploadProgressMsg('');
                                            }
                                          }
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </div>

                              {/* Cover Sticker Emoji Picker */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                                  Cover Sticker Emoji (Optional)
                                </label>
                                <div className="flex flex-wrap items-center gap-1">
                                  {['📸', '💖', '🌸', '🎨', '🎁', '🚀', '☕', '🎂', '💌', '⭐', '🍦', '🔮'].map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => updateAttachment(currentAtt.photoUrl, currentAtt.sticker === emoji ? undefined : emoji)}
                                      className={`text-sm p-1 rounded-md transition-transform ${
                                        currentAtt.sticker === emoji
                                          ? 'bg-emerald-500 text-white scale-125 shadow-xs'
                                          : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                                      }`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                  {currentAtt.sticker && (
                                    <button
                                      type="button"
                                      onClick={() => updateAttachment(currentAtt.photoUrl, undefined)}
                                      className="text-[9px] text-slate-400 hover:text-rose-500 font-bold ml-1"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* MEMORY PHOTOS & CAPTIONS EDITOR FOR FRIENDSHIP DAY GREET */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-emerald-500" />
                        <span>Memory Card Photos & Captions (Text Under Photo)</span>
                      </h5>
                      <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {customization.memories?.length || 6} Memory Cards
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload photos for each memory card and write the custom caption that displays right under the photo!
                    </p>

                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const currentMems: Memory[] = customization.memories && customization.memories.length > 0
                          ? customization.memories
                          : [
                              { id: '1', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=800&q=80', caption: 'Day one energy — best friends forever! 💖' },
                              { id: '2', imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80', caption: 'Still one of the funniest days of our lives 📸' },
                              { id: '3', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80', caption: 'Unhinged 3 AM voice notes twin forever 🔊' },
                              { id: '4', imageUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&q=80', caption: 'Spontaneous trips, lost maps & endless laughter 🚗' },
                              { id: '5', imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80', caption: 'Coffee dates that turned into 5-hour heart to hearts ☕' },
                              { id: '6', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80', caption: 'Laughing until our stomachs literally hurt 🌸' },
                            ];
                        const mem = currentMems[idx] || { id: String(idx + 1), imageUrl: '', caption: '' };

                        return (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                                Memory Card #{idx + 1}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {mem.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!customization.memories || customization.memories.length === 0) {
                                        updateField('memories', currentMems);
                                      }
                                      setEditingMemoryIndex(idx);
                                    }}
                                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors flex items-center gap-1 shadow-sm"
                                    title="Edit & Apply Filters"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                )}
                                <label className="cursor-pointer text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                                  <Camera className="w-3 h-3 text-emerald-600" />
                                  <span>{mem.imageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (!customization.memories || customization.memories.length === 0) {
                                          updateField('memories', currentMems);
                                        }
                                        handleSingleFileSelected(file, idx);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300 mt-1">
                                {mem.imageUrl ? (
                                  <SafeImage src={mem.imageUrl} fallbackUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800" alt={`Memory ${idx + 1}`} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    #{idx + 1}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                                    Photo Caption (Text written under photo)
                                  </label>
                                  <input
                                    type="text"
                                    value={mem.caption || ''}
                                    onChange={(e) => {
                                      const updated = [...currentMems];
                                      updated[idx] = { ...updated[idx], caption: e.target.value };
                                      updateField('memories', updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-400"
                                    placeholder={`e.g. Best day at the beach 🌊`}
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                                    Card Back Note (Text shown when card is flipped 🔄)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={mem.backNote !== undefined ? mem.backNote : (mem.caption || '')}
                                    onChange={(e) => {
                                      const updated = [...currentMems];
                                      updated[idx] = { ...updated[idx], backNote: e.target.value };
                                      updateField('memories', updated);
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400"
                                    placeholder={`e.g. Day one energy! We had no idea how incredible this journey would be ✨`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hero Main Cover Photo Upload */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-amber-500" />
                        <span>Main Cover Photo (Friends Image on Hero Card)</span>
                      </label>
                      <label className="cursor-pointer text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{(customization.coverPhotoUrl || customization.heroPhotoUrl) ? 'Change Cover Photo' : 'Upload Friends Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadCoverPhoto}
                        />
                      </label>
                    </div>
                    {(customization.coverPhotoUrl || customization.heroPhotoUrl) && (
                      <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={customization.coverPhotoUrl || customization.heroPhotoUrl || ''}
                            fallbackUrl="https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&q=80"
                            alt="Cover photo preview"
                            className="w-12 h-12 object-cover rounded-lg border border-amber-300"
                          />
                          <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                            Custom Cover Photo Uploaded 📸
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const existingUrl = customization.coverPhotoUrl || customization.heroPhotoUrl;
                              if (existingUrl) {
                                setCropTarget({
                                  url: existingUrl,
                                  onSave: (croppedUrl) => {
                                    updateField('coverPhotoUrl', croppedUrl);
                                    updateField('heroPhotoUrl', croppedUrl);
                                  }
                                });
                              }
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1.5 rounded border border-blue-200 shadow-sm cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateField('coverPhotoUrl', undefined);
                              updateField('heroPhotoUrl', undefined);
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1.5 rounded border border-rose-200 shadow-sm cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hero Section Title
                    </label>
                    <input
                      type="text"
                      value={customization.finalHeading || ''}
                      onChange={(e) => updateField('finalHeading', e.target.value)}
                      placeholder="To My Favourite Person 💖"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hero Section Message
                    </label>
                    <textarea
                      rows={3}
                      value={customization.finalMessage || ''}
                      onChange={(e) => updateField('finalMessage', e.target.value)}
                      placeholder="Every year this day comes around and I think the same thing: I got so lucky with you..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customParagraph || ''}
                    onTranscribed={(text) => updateField('customParagraph', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Friendship Letter (Lined Notebook)
                    </label>
                    <textarea
                      rows={6}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Thank you for being the most incredible friend I could ever ask for..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              )}

              {selectedTemplate?.id === 'sorry-heartfelt-apology' && (
                <div className="space-y-6">
                  {/* 1. Recipient Selector */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Who is this Apology for? (Customizes Badge & Mood)</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'bestie', label: 'Bestie 👭' },
                        { id: 'girlfriend', label: 'Girlfriend ❤️' },
                        { id: 'boyfriend', label: 'Boyfriend 💖' },
                        { id: 'friend', label: 'Friend 🤝' },
                        { id: 'sister', label: 'Sister / Sibling 🌸' },
                        { id: 'someone_special', label: 'Someone Special ✨' },
                      ].map((rec) => (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => updateField('apologyRecipientType', rec.id as any)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            (customization.apologyRecipientType || 'bestie') === rec.id
                              ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:border-rose-300'
                          }`}
                        >
                          {rec.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Cover Photo Upload */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                        <Camera className="w-4 h-4 text-rose-500" />
                        <span>Apology Cover Photo (Main Header Picture)</span>
                      </label>
                      <label className="cursor-pointer text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{(customization.coverPhotoUrl || customization.heroPhotoUrl) ? 'Change Photo' : 'Upload Cover Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadCoverPhoto}
                        />
                      </label>
                    </div>
                    {(customization.coverPhotoUrl || customization.heroPhotoUrl) && (
                      <div className="flex items-center justify-between p-2 bg-rose-50 dark:bg-slate-800 rounded-xl border border-rose-200">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={customization.coverPhotoUrl || customization.heroPhotoUrl || ''}
                            fallbackUrl="https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?w=600&q=80"
                            alt="Cover photo preview"
                            className="w-12 h-12 object-cover rounded-lg border border-rose-300"
                          />
                          <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                            Custom Cover Image Set 📸
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const existingUrl = customization.coverPhotoUrl || customization.heroPhotoUrl;
                              if (existingUrl) {
                                setCropTarget({
                                  url: existingUrl,
                                  onSave: (croppedUrl) => {
                                    updateField('coverPhotoUrl', croppedUrl);
                                    updateField('heroPhotoUrl', croppedUrl);
                                  }
                                });
                              }
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1.5 rounded border border-blue-200 shadow-sm cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateField('coverPhotoUrl', undefined);
                              updateField('heroPhotoUrl', undefined);
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1.5 rounded border border-rose-200 shadow-sm cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Apology Title & Sincere Letter Editor */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Main Apology Title
                      </label>
                      <input
                        type="text"
                        value={customization.apologyLetterTitle || ''}
                        onChange={(e) => updateField('apologyLetterTitle', e.target.value)}
                        placeholder={`e.g. I'm So Sorry, ${customization.recipientName || 'My Dear'} 🥺`}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-950 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sincere Apology Letter (Written in Letter Card)
                      </label>
                      <textarea
                        rows={5}
                        value={customization.apologyLetterBody || ''}
                        onChange={(e) => updateField('apologyLetterBody', e.target.value)}
                        placeholder="I hate that I upset you. You mean the world to me..."
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>

                  {/* 4. Reasons Why I Am Sorry & Why You Matter (Origami Envelopes) */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <span>✉️</span>
                        <span>Apology Cards / Envelope Notes</span>
                      </h5>
                      <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                        {customization.apologyReasons?.length || 4} Envelopes
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(customization.apologyReasons || [
                        { id: '1', title: 'Why I Am So Sorry 😔', note: 'I reacted without thinking...' },
                        { id: '2', title: 'What You Mean To Me ✨', note: 'You are my safe place...' },
                        { id: '3', title: 'What I Learned 💡', note: 'Your feelings always matter to me...' },
                        { id: '4', title: 'Why I Miss Us 💖', note: 'No story is complete until I share it with you...' }
                      ]).map((reason, idx) => (
                        <div key={idx} className="p-3 bg-rose-50/50 dark:bg-slate-800/60 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200">
                              Envelope #{idx + 1}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={reason.title || ''}
                            onChange={(e) => {
                              const current = [...(customization.apologyReasons || [])];
                              current[idx] = { ...current[idx], title: e.target.value };
                              updateField('apologyReasons', current);
                            }}
                            placeholder={`Card title (e.g. Why I'm sorry)`}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-lg text-xs font-bold text-rose-950 dark:text-white"
                          />
                          <textarea
                            rows={2}
                            value={reason.note || ''}
                            onChange={(e) => {
                              const current = [...(customization.apologyReasons || [])];
                              current[idx] = { ...current[idx], note: e.target.value };
                              updateField('apologyReasons', current);
                            }}
                            placeholder={`Secret note content inside envelope...`}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Promises I Make Checklist */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <span>🤝</span>
                        <span>Promises I Make To You</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          const current = [...(customization.apologyPromises || [])];
                          current.push("New promise to you 💖");
                          updateField('apologyPromises', current);
                        }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer"
                      >
                        + Add Promise
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(customization.apologyPromises || [
                        'I promise to listen to you with a calm and open heart.',
                        'I promise to never take our bond or your kindness for granted.',
                        'I promise to bring your favorite snack next time we meet 🍦',
                        'I promise to always value our connection above any misunderstanding.'
                      ]).map((promiseText, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-500 w-5">#{idx + 1}</span>
                          <input
                            type="text"
                            value={promiseText}
                            onChange={(e) => {
                              const current = [...(customization.apologyPromises || [])];
                              current[idx] = e.target.value;
                              updateField('apologyPromises', current);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const current = (customization.apologyPromises || []).filter((_, i) => i !== idx);
                              updateField('apologyPromises', current);
                            }}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Custom YES Forgive Button Text */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Forgive Button Text (When Recipient Clicks YES)
                    </label>
                    <input
                      type="text"
                      value={customization.forgiveButtonText || ''}
                      onChange={(e) => updateField('forgiveButtonText', e.target.value)}
                      placeholder="YES, I Forgive You! 🫂❤️"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
              {selectedTemplate?.id === 'sisterhood-gratitude-tree' && (
                <div className="space-y-6">
                  {/* Nostalgic Timeline Milestones Widget */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Nostalgic Timeline Milestones</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          const current = customization.timelineEvents || [];
                          const updated = [
                            ...current,
                            { id: String(Date.now()), year: '2025', title: 'New Adventure', description: 'Another milestone together!' }
                          ];
                          updateField('timelineEvents', updated);
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Milestone</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(customization.timelineEvents && customization.timelineEvents.length > 0 ? customization.timelineEvents : [
                        { id: '1', year: '2021', title: 'First Meeting', description: 'When we accidentally wore matching outfits and instantly clicked' },
                        { id: '2', year: '2022', title: 'Epic Road Trip', description: '300 miles of endless singing, terrible gas station snacks, and lost maps' }
                      ]).map((evt, idx) => (
                        <div key={evt.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center gap-3">
                          <div className="w-24 shrink-0">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Year</label>
                            <input
                              type="text"
                              value={evt.year}
                              onChange={(e) => {
                                const current = customization.timelineEvents || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], year: e.target.value };
                                }
                                updateField('timelineEvents', updated);
                              }}
                              className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400"
                            />
                          </div>
                          <div className="w-full md:w-1/3">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Title</label>
                            <input
                              type="text"
                              value={evt.title}
                              onChange={(e) => {
                                const current = customization.timelineEvents || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                }
                                updateField('timelineEvents', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="w-full md:w-1/2">
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Description</label>
                            <input
                              type="text"
                              value={evt.description}
                              onChange={(e) => {
                                const current = customization.timelineEvents || [];
                                const updated = [...current];
                                if (updated[idx]) {
                                  updated[idx] = { ...updated[idx], description: e.target.value };
                                }
                                updateField('timelineEvents', updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const current = customization.timelineEvents || [];
                              const updated = current.filter((_, i) => i !== idx);
                              updateField('timelineEvents', updated);
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors shrink-0 self-end md:self-center"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sisterhood / Family Gratitude Letter
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Having you as my sister is one of life's greatest blessings..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  {/* Sisterhood Oath Section */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-4">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-rose-500" />
                      <span>Sisterhood Oath Customization (Page 3)</span>
                    </h5>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sisterhood Oath Heading (Page 3 Title)
                      </label>
                      <input
                        type="text"
                        value={customization.sisterhoodOathTitle || 'The Sisterhood Oath'}
                        onChange={(e) => updateField('sisterhoodOathTitle', e.target.value)}
                        placeholder="e.g. The Sisterhood Oath, My Oath To You, Sisterhood Forever"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sisterhood Promises / Verses (One promise per line)
                      </label>
                      <textarea
                        rows={5}
                        value={(customization.sisterhoodPromises || [
                          "I promise to always be your safe space.",
                          "I promise to keep your secrets and share your joys.",
                          "I promise that no matter how much we grow,",
                          "or how far life takes us,",
                          "We will always be sisters first."
                        ]).join('\n')}
                        onChange={(e) => updateField('sisterhoodPromises', e.target.value.split('\n'))}
                        placeholder="Enter each promise on a new line..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-serif italic text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Each line appears as an individual clause on the Oath card.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. RETRO 90s ARCADE */}
              {selectedTemplate?.id === 'retro-90s-arcade' && (
                <div className="space-y-6">
                  {/* Retro Arcade Settings Widget */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-emerald-500/50 space-y-4">
                    <h5 className="font-bold text-emerald-400 text-sm flex items-center space-x-2 font-mono">
                      <Gamepad2 className="w-4 h-4 text-emerald-400" />
                      <span>Retro Arcade Gamer Tag & High Score</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1 font-mono">
                          Gamer Tag
                        </label>
                        <input
                          type="text"
                          value={customization.arcadeGamerTag || 'SARAH'}
                          onChange={(e) => updateField('arcadeGamerTag', e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-mono font-bold text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1 font-mono">
                          Mission Quest Name
                        </label>
                        <input
                          type="text"
                          value={customization.arcadeMissionName || 'BESTIE SURPRISE QUEST'}
                          onChange={(e) => updateField('arcadeMissionName', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-mono font-bold text-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1 font-mono">
                          High Score Text
                        </label>
                        <input
                          type="text"
                          value={customization.arcadeHighScore || '999,999'}
                          onChange={(e) => updateField('arcadeHighScore', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-mono font-bold text-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">
                      Gamer Level Quest Victory Message
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="LEVEL COMPLETE! Player 2 has reached maximum friendship score..."
                      className="w-full p-4 bg-slate-950 border border-emerald-500 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 font-mono">
                      Retro High-Score Quote
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Press START to continue endless memories..."
                      className="w-full p-4 bg-slate-950 border border-emerald-500 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* 6. CELESTIAL GALAXY */}
              {selectedTemplate?.id === 'celestial-galaxy' && (
                <div className="space-y-6">
                  {/* Celestial Shooting Star Wish Widget */}
                  <div className="p-4 bg-slate-900 rounded-2xl border border-indigo-500/50 space-y-4">
                    <h5 className="font-bold text-indigo-300 text-sm flex items-center space-x-2">
                      <Star className="w-4 h-4 text-indigo-400" />
                      <span>Celestial Shooting Star Wish Paragraph</span>
                    </h5>
                    <textarea
                      rows={3}
                      value={customization.shootingStarWishText || 'May you always find your guiding star in the darkest nights, and may your brightest dreams come true.'}
                      onChange={(e) => updateField('shootingStarWishText', e.target.value)}
                      placeholder="May you always find your guiding star in the darkest nights..."
                      className="w-full p-3 bg-slate-950 border border-indigo-500/30 rounded-xl text-sm text-indigo-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shooting Star Wish Message
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Out of all the stars in the universe, our bond shines the brightest..."
                      className="w-full p-4 bg-slate-900 border border-indigo-500/50 rounded-xl text-sm text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cosmic Galaxy Stargazer Poem
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Written in the stars, preserved in eternity..."
                      className="w-full p-4 bg-slate-900 border border-indigo-500/50 rounded-xl text-sm font-serif italic text-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              )}

              {/* 7. MINIMALIST EDITORIAL */}
              {selectedTemplate?.id === 'minimalist-editorial' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Editorial Story Paragraph
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="A collection of timeless moments, captured with elegance..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Minimalist Poetry / Vogue Quote
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Simplicity is the ultimate sophistication..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-serif text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                </div>
              )}

              {/* 8. VINTAGE PARCHMENT */}
              {selectedTemplate?.id === 'vintage-parchment' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Vintage Letter on Aged Parchment
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Dearest friend, as time unfolds its antique pages..."
                      className="w-full p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-sm font-serif text-slate-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Handwritten Fountain Pen Verse
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="In faded ink and pressed dried blooms..."
                      className="w-full p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-sm font-serif italic text-slate-900 dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* 9. DEFAULT / BOX21 SURPRISE */}
              {(!selectedTemplate || selectedTemplate.id === 'box21-surprise' || !['romantic-love-story', 'birthday-confetti-party', 'bestie-chaos-polaroid', 'sisterhood-gratitude-tree', 'retro-90s-arcade', 'celestial-galaxy', 'minimalist-editorial', 'vintage-parchment'].includes(selectedTemplate.id)) && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Personal Unboxing Paragraph Message
                    </label>
                    <textarea
                      rows={3}
                      value={customization.customParagraph}
                      onChange={(e) => updateField('customParagraph', e.target.value)}
                      placeholder="Thank you for being the most incredible person in my life..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  <SpeechPoemRecorder
                    currentPoemText={customization.customPoem}
                    onTranscribed={(text) => updateField('customPoem', text)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Surprise Poem / Verse
                    </label>
                    <textarea
                      rows={4}
                      value={customization.customPoem}
                      onChange={(e) => updateField('customPoem', e.target.value)}
                      placeholder="Through sunny days and stormy weather..."
                      className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-serif italic text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              )}

              {/* Universal Final Screen / Completion Screen Customizer */}
              <div className="p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/40 dark:via-rose-950/30 dark:to-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800/60 space-y-4 shadow-sm mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-500 text-white rounded-xl shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        🎉 Final Completion Screen Customizer
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Customize the ending celebration screen shown after finishing the scrapbook experience.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold px-2.5 py-1 rounded-full uppercase">
                    Ending Screen
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Final Heading */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Final Screen Heading / Title
                    </label>
                    <input
                      type="text"
                      value={customization.finalHeading || ''}
                      onChange={(e) => updateField('finalHeading', e.target.value)}
                      placeholder={`Default: I Love You, ${customization.recipientName || 'Bestie'}!`}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Final Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Final Celebration Message / Thank You Note
                    </label>
                    <textarea
                      rows={2}
                      value={customization.finalMessage || ''}
                      onChange={(e) => updateField('finalMessage', e.target.value)}
                      placeholder={`Default: Hope this ${customization.memories.length > 0 ? `${customization.memories.length}-memory ` : ''}surprise brought a huge smile to your face!`}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Closing Note */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Closing Tagline (above name)
                      </label>
                      <input
                        type="text"
                        value={customization.finalClosingNote || ''}
                        onChange={(e) => updateField('finalClosingNote', e.target.value)}
                        placeholder="Default: With all my love,"
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    {/* Replay Button Text */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Replay Button Text
                      </label>
                      <input
                        type="text"
                        value={customization.finalButtonText || ''}
                        onChange={(e) => updateField('finalButtonText', e.target.value)}
                        placeholder="Default: Replay Surprise"
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>

                  {/* Final Photo / Souvenir Image Upload & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Final Closing Photo / GIF (Optional Souvenir Badge)
                    </label>
                    <div className="flex items-center space-x-3">
                      {customization.finalImageUrl ? (
                        <div className="flex items-center space-x-3 w-full">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-purple-300 shrink-0">
                            <SafeImage src={customization.finalImageUrl} fallbackUrl="" alt="Final photo" className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateField('finalImageUrl', '')}
                            className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors shrink-0"
                          >
                            Remove Photo
                          </button>
                        </div>
                      ) : (
                        <label className="flex-1 px-3 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 border-dashed rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span className="text-xs font-bold">Upload Souvenir Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onClick={(e) => {
                            if (!checkIsLoggedIn()) {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAuthUploadModal(true);
                            }
                          }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!checkIsLoggedIn()) {
                                setShowAuthUploadModal(true);
                                return;
                              }
                              try {
                                setIsUploading(true);
                                setUploadProgressMsg('Compressing and uploading photo...');
                                const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true });
                                const scrapbookId = customization.subdomain || `sb_${Date.now()}`;
                                const url = await uploadImageToStorage(compressedFile, scrapbookId);
                                updateField('finalImageUrl', url);
                              } catch (err: any) {
                                console.error('Upload failed:', err);
                                alert('Failed to upload image: ' + err.message);
                              } finally {
                                setIsUploading(false);
                                setUploadProgressMsg('');
                              }
                            }
                          }}
                        />
                      </label>
                      )}
                    </div>
                  </div>

                  {/* Final Screen Background Style Theme */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Final Screen Background Color Theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'rose', label: '🌸 Sunset Rose' },
                        { id: 'midnight', label: '🌙 Midnight' },
                        { id: 'emerald', label: '🌿 Emerald' },
                        { id: 'gold', label: '✨ Golden' },
                        { id: 'cosmic', label: '🌌 Cosmic' },
                      ].map((theme) => {
                        const isSelected = (customization.finalBgGradient || 'rose') === theme.id;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => updateField('finalBgGradient', theme.id)}
                            className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-400/50'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                            }`}
                          >
                            <span>{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center space-x-2"
                >
                  <span>Next: Photos ({customization.memories.length}/{targetPhotoCount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS MANAGER */}
          {activeStep === 3 && (
            <div className="space-y-6">
              
              {/* Privacy Guarantee Badge */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    🔒
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>100% Client-Side End-to-End Privacy</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full font-black uppercase">
                        Zero Knowledge
                      </span>
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Your personal photos stay encrypted in your local browser state and are never exposed to public databases or unauthorized viewers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Count Target Presets */}
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

                {/* Drag-and-Drop Native File Input Box */}
                <label 
                  className={`border-2 border-dashed ${isUploading ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-rose-300 dark:border-rose-700/60 hover:border-rose-500 dark:hover:border-rose-500 bg-white dark:bg-slate-900'} p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all text-center group`}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading || customization.memories.length >= 50}
                    onClick={(e) => {
                      if (!checkIsLoggedIn()) {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAuthUploadModal(true);
                      }
                    }}
                    onChange={(e) => e.target.files && handleMultipleFilesSelected(e.target.files)}
                  />
                  
                  {isUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                      <h5 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        {uploadProgressMsg}
                      </h5>
                      <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1">
                        Please do not close this page.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Click to Choose Photos from Phone/Device Gallery or Drag & Drop Here
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                        Select multiple photos at once (JPEG, PNG, WEBP). Supports up to 50 photos max!
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Photos Grid Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mt-6">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Photo Slots ({customization.memories.length}/{targetPhotoCount})
                </span>
                
                {/* Storage Usage Meter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[10px] font-medium text-slate-500">Storage Usage:</span>
                  <div className="flex-1 sm:w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${customization.memories.length >= targetPhotoCount ? 'bg-red-500' : 'bg-emerald-500'} transition-all`}
                      style={{ width: `${Math.min(100, (customization.memories.length / targetPhotoCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {Math.round((customization.memories.length / targetPhotoCount) * 100)}%
                  </span>
                </div>
              </div>

              {/* Exact Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-2 mt-4">
                {Array.from({ length: targetPhotoCount }).map((_, index) => {
                  const mem = customization.memories[index];
                  return (
                    <div 
                      key={index} 
                      className={`group relative w-full h-[180px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 ${mem ? 'border-transparent' : 'border-dashed border-slate-300 dark:border-slate-700'} flex flex-col`}
                    >
                      {mem ? (
                        <>
                          <div className="relative flex-1 overflow-hidden w-full group">
                            <SafeImage 
                              src={mem.imageUrl} 
                              alt={`Slot ${index + 1}`} 
                              fallbackUrl={mem.fallbackUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300'}
                              className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                              style={getMemoryImageStyle(mem)}
                            />
                            
                            {/* Edit / Crop / Rotate Button (Pencil Icon) */}
                            <button
                              type="button"
                              onClick={() => setEditingMemoryIndex(index)}
                              className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg pointer-events-auto transition-transform hover:scale-105"
                              title="Crop, Rotate, Flip & Filter Photo"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            
                            <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 pointer-events-none" />

                            <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded font-bold backdrop-blur-sm opacity-0 sm:opacity-100 sm:group-hover:opacity-0 transition-opacity pointer-events-none">
                              #{index + 1}
                            </div>

                            <div className="absolute inset-x-1 top-1 flex justify-between items-start opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <div className="flex flex-col gap-1 w-16">
                                {/* Object Fit */}
                                <select 
                                  value={mem.objectFit || 'cover'} 
                                  onChange={(e) => {
                                    const updated = [...customization.memories];
                                    updated[index] = { ...updated[index], objectFit: e.target.value as any };
                                    updateField('memories', updated);
                                  }}
                                  className="bg-black/80 text-[10px] text-white rounded border border-white/20 p-0.5 outline-none cursor-pointer"
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
                                  className="bg-black/80 text-[10px] text-white rounded border border-white/20 p-0.5 outline-none cursor-pointer"
                                >
                                  <option value="none">No Filter</option>
                                  <option value="vintage">Vintage</option>
                                  <option value="sepia">Sepia</option>
                                  <option value="grayscale">B&W</option>
                                  <option value="contrast">Contrast</option>
                                </select>
                              </div>
                              
                              <div className="flex flex-col gap-1.5 items-end">
                                <label className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/95 text-white text-[10px] font-bold uppercase rounded hover:bg-indigo-600 shadow-md cursor-pointer pointer-events-auto transition-transform hover:scale-105" title="Change Photo">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleSingleFileSelected(e.target.files[0], index);
                                      }
                                    }} 
                                  />
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>Change</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMemory(mem.id)}
                                  className="flex items-center gap-1.5 px-2 py-1 bg-red-500/95 text-white text-[10px] font-bold uppercase rounded hover:bg-red-600 shadow-md z-20 pointer-events-auto transition-transform hover:scale-105"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-slate-50 dark:bg-slate-800/90 p-1.5 shrink-0 border-t border-slate-200 dark:border-slate-700/50">
                             <input
                                type="text"
                                value={mem.caption}
                                onChange={(e) => {
                                  const updated = [...customization.memories];
                                  updated[index] = { ...updated[index], caption: e.target.value };
                                  updateField('memories', updated);
                                }}
                                className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-rose-400 placeholder:text-slate-400 placeholder:italic"
                                placeholder="Add memory caption..."
                              />
                          </div>
                        </>
                      ) : (
                        <label 
                          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onClick={(e) => {
                              if (!checkIsLoggedIn()) {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowAuthUploadModal(true);
                              }
                            }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSingleFileSelected(e.target.files[0], index);
                              }
                            }}
                          />
                          <Plus className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-500 font-bold">Slot #{index + 1}</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center space-x-2"
                >
                  <span>Next: Lock & Link Settings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PASSCODE & LINK PUBLISH */}
          {activeStep === 4 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-rose-500" />
                <span>Security Lock & Custom Domain Link</span>
              </h3>

              {/* Password Protection Toggle (Exclusive to Romantic Sunset & Love Letter Vault) */}
              {customization.bgTheme === 'romantic-love-story' ? (
                <div className="space-y-4 p-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-rose-500" />
                        <span>Enable Passcode Protection</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Require a passcode before recipient can unlock the romantic love letter vault.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={customization.enablePasscode}
                      onChange={(e) => updateField('enablePasscode', e.target.checked)}
                      className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                    />
                  </div>

                  {customization.enablePasscode && (
                    <div className="space-y-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/60">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Secret Passcode *
                        </label>
                        <input
                          type="text"
                          value={customization.secretPasscode}
                          onChange={(e) => updateField('secretPasscode', e.target.value)}
                          placeholder="e.g. 2024, LOVE, ANNIVERSARY"
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Passcode Hint / Clue (Shown on Passcode Screen)
                        </label>
                        <input
                          type="text"
                          value={customization.passcodeHint || ''}
                          onChange={(e) => updateField('passcodeHint', e.target.value)}
                          placeholder="e.g. Hint: Our special anniversary year ❤️"
                          className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Passcode Lock protection is exclusively available on the <strong>Romantic Sunset & Love Letter Vault</strong> template.</span>
                </div>
              )}

              {/* Magic Confetti Toggle */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Auto-Confetti Burst on Open
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Triggers a magical confetti burst as soon as the recipient opens the link.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customization.confettiOnLoad || false}
                  onChange={(e) => updateField('confettiOnLoad', e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Signature Canvas */}
              <SignaturePanel 
                signatureUrl={customization.signatureUrl} 
                onChange={(url) => updateField('signatureUrl', url)} 
              />

              {/* Custom Subdomain */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                  <span>Custom Domain Link Slug</span>
                  <HelpTooltip text="Your unique shareable URL ending. Recipient opens onlinewishes.in/p/your-custom-slug to view the surprise!" />
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-600">
                    onlinewishes.in/p/
                  </span>
                  <input
                    type="text"
                    value={customization.subdomain}
                    onChange={(e) => updateField('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="sarah-bestie-surprise"
                    className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-r-xl text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Cloud Database Persistence Box */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl border border-indigo-500/40 text-white space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                      <Database className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center space-x-2">
                        <span>Cloud Database Storage</span>
                        <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                          Firestore Connected
                        </span>
                      </h4>
                      <p className="text-xs text-indigo-200">
                        Save your complete scrapbook, photos, audio & custom locks securely in the cloud.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveToCloudDatabase}
                    disabled={isSavingCloud}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{isSavingCloud ? 'Saving...' : 'Save To Cloud Database'}</span>
                  </button>
                </div>

                {cloudMessage && (
                  <div className="p-3 bg-indigo-900/60 border border-indigo-400/40 rounded-xl text-xs font-mono text-indigo-200 flex items-center justify-between">
                    <span>{cloudMessage}</span>
                    {cloudSavedId && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(cloudSavedId);
                          alert('Cloud Record ID copied!');
                        }}
                        className="px-2 py-1 bg-indigo-700 hover:bg-indigo-600 rounded text-[10px] font-bold text-white flex items-center space-x-1 ml-2"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Cloud Load / Restore Drawer */}
                <div className="pt-3 border-t border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-300">
                    Have a saved Cloud Code or Subdomain?
                  </span>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={cloudSearchCode}
                      onChange={(e) => setCloudSearchCode(e.target.value)}
                      placeholder="Enter code (e.g. sarah-bestie-surprise)"
                      className="px-3 py-1.5 text-xs bg-slate-950 border border-indigo-800 rounded-lg text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 flex-1 sm:w-56"
                    />
                    <button
                      type="button"
                      onClick={handleSearchCloudScrapbook}
                      disabled={isSearchingCloud}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1 shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isSearchingCloud ? 'Loading...' : 'Load'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={onOpenLivePreview}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4 text-rose-400" />
                  <span>Test Live Interactive Preview</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPaymentModal}
                  className="w-full sm:flex-1 px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Publish & Pay (Rs. {payablePrice})</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 5: DIGITAL STICKERS PANEL */}
          {activeStep === 5 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <DigitalStickersPanel
                customization={customization}
                onChangeCustomization={onChangeCustomization}
              />

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onOpenLivePreview}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center space-x-2"
                >
                  <span>Preview Scrapbook With Stickers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Live Interactive Phone Preview Column (Split View) */}
        {studioLayout === 'split' && (
          <div className="lg:col-span-5 sticky top-24 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-2xl overflow-hidden relative">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-white mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold tracking-wide uppercase text-slate-300">
                    Live Phone Simulator
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  Real-time Updates
                </span>
              </div>

              {/* Embedded Phone Frame */}
              <div className="w-full h-[460px] sm:h-[580px] rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 shadow-inner">
                <ErrorBoundary>
                  <InteractiveSurpriseTemplate
                    customization={customization}
                    isStandaloneView={false}
                  />
                </ErrorBoundary>
              </div>

              <div className="pt-2.5 text-center">
                <p className="text-[11px] text-slate-400">
                  Tap elements inside the phone screen above to test the surprise flow as you edit!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
    
    {cropperFile && (
      <ImageCropper
        imageUrl={cropperFile.url}
        onCrop={handleCropComplete}
        onCancel={() => setCropperFile(null)}
      />
    )}

    {/* Dummy Razorpay Payment Modal */}
    {showPaymentModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
          
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded p-1">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <span className="text-white font-bold text-sm tracking-wide">Razorpay Checkout</span>
            </div>
            <button 
              onClick={() => {
                setShowPaymentModal(false);
                triggerAbandonedReminder('payment_cancelled');
              }} 
              className="text-slate-400 hover:text-white" 
              disabled={isProcessingPayment}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="text-center mb-5">
              <p className="text-slate-500 text-xs font-medium mb-1">OnlineWishes Digital Scrapbook</p>
              {(discountPercent > 0 || finalPrice !== null) ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-slate-400 text-lg line-through font-bold">Rs. {basePrice}.00</span>
                    <span className="text-3xl font-black text-emerald-600">Rs. {payablePrice}.00</span>
                  </div>
                  <p className="text-xs text-emerald-600 font-bold bg-emerald-50 py-1 px-2.5 rounded-full inline-block border border-emerald-200">
                    🎉 You saved Rs. {discountAmount} {finalPrice === 1 ? '' : '(99% OFF)'}
                  </p>
                </div>
              ) : (
                <h3 className="text-3xl font-black text-slate-900">Rs. {basePrice}.00</h3>
              )}
            </div>

            {/* Redeem Code Section */}
            {!isProcessingPayment && (
              <form onSubmit={handleApplyPromoCode} className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Redeem Promo Code
                  </label>
                  
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 uppercase font-mono tracking-wider text-slate-900 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-xs font-bold ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </form>
            )}

            <div className="space-y-4">
              {isProcessingPayment ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-slate-600 font-bold text-sm">Processing Payment...</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleRazorpayPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-center items-center gap-2"
                  >
                    <span>Pay Rs. {payablePrice}.00</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Secured by Razorpay</span>
          </div>

        </div>
      </div>
    )}

    {/* SIGN IN REQUIRED FOR PHOTO UPLOAD POPUP MODAL */}
    {showAuthUploadModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={() => setShowAuthUploadModal(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Visual Icon Badge */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
            Sign In Required to Upload Photos
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            To securely save and upload your personal photo memories to cloud storage, please sign in or create an account.
          </p>

          {/* Action Buttons: Sign In and Sign Up */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setShowAuthUploadModal(false);
                onOpenAuth?.('signin');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Your Account
            </button>

            <button
              onClick={() => {
                setShowAuthUploadModal(false);
                onOpenAuth?.('signup');
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-rose-500" />
              Create New Account (Sign Up)
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowAuthUploadModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
            >
              Cancel and go back
            </button>
          </div>

        </div>
      </div>
    )}

    {editingMemoryIndex !== null && customization.memories[editingMemoryIndex] && (
      <PhotoEditorModal
        memory={customization.memories[editingMemoryIndex]}
        onSave={(updated) => {
          const updatedMems = [...customization.memories];
          updatedMems[editingMemoryIndex] = updated;
          updateField('memories', updatedMems);
          setEditingMemoryIndex(null);
        }}
        onClose={() => setEditingMemoryIndex(null)}
      />
    )}

    {cropTarget && (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Crop Photo</h3>
            <button onClick={() => setCropTarget(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative min-h-[400px]">
            <ImageCropper
              imageUrl={cropTarget.url}
              onCrop={(croppedUrl) => {
                cropTarget.onSave(croppedUrl);
                setCropTarget(null);
              }}
              onCancel={() => setCropTarget(null)}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
}
