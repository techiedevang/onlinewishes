import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  getDocFromServer
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';
import { UserCustomization } from '../types';
import CryptoJS from 'crypto-js';

export interface SavedScrapbookRecord {
  id: string;
  customization: UserCustomization;
  createdAt: string;
  updatedAt: string;
}

// Test initial connection to Firestore
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

/**
 * Saves or updates a scrapbook project in Firestore
 * Uses E2E AES Encryption if a passcode is provided.
 */
export async function saveScrapbookToCloud(
  customization: UserCustomization
): Promise<string> {
  const scrapbookId = customization.subdomain || `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `scrapbooks/${scrapbookId}`;

  const isEncrypted = Boolean(customization.enablePasscode && customization.secretPasscode);
  const rawJson = JSON.stringify(customization);
  
  let payload: any = {
    id: scrapbookId,
    userId: auth.currentUser?.uid || null,
    recipientName: customization.recipientName || 'Bestie',
    occasion: customization.occasion || 'Special Day',
    senderName: customization.senderName || 'Your Friend',
    subdomain: customization.subdomain || scrapbookId,
    isLocked: isEncrypted,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isEncrypted) {
    // End-to-end encryption: Server never sees the passcode or the photos
    const encryptedData = CryptoJS.AES.encrypt(rawJson, customization.secretPasscode!).toString();
    payload.encryptedData = encryptedData;
  } else {
    // No privacy protection
    payload.customizationJson = rawJson;
  }

  try {
    await setDoc(doc(db, 'scrapbooks', scrapbookId), payload, { merge: true });
    return scrapbookId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Retrieves a scrapbook project by ID or subdomain code
 */
export async function loadScrapbookFromCloud(
  scrapbookId: string,
  passcode?: string
): Promise<{ customization?: UserCustomization; isLocked?: boolean; error?: string } | null> {
  const path = `scrapbooks/${scrapbookId}`;

  try {
    const docRef = doc(db, 'scrapbooks', scrapbookId);
    const docSnap = await getDoc(docRef);
    let data: any = null;

    if (docSnap.exists()) {
      data = docSnap.data();
    } else {
      // Try query by subdomain
      const q = query(collection(db, 'scrapbooks'), where('subdomain', '==', scrapbookId));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        data = querySnap.docs[0].data();
      }
    }

    if (!data) return null;

    if (data.isLocked && data.encryptedData) {
      if (!passcode) {
        return { isLocked: true, error: 'Passcode required' };
      }
      try {
        const bytes = CryptoJS.AES.decrypt(data.encryptedData, passcode);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedStr) throw new Error('Decryption failed');
        const customization = JSON.parse(decryptedStr) as UserCustomization;
        return { customization, isLocked: false };
      } catch (err) {
        return { isLocked: true, error: 'Invalid passcode' };
      }
    } else if (data.customizationJson) {
      return { customization: JSON.parse(data.customizationJson) as UserCustomization, isLocked: false };
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Saves a payment transaction record to Firestore so it appears in dashboards
 */
export async function recordPaymentInCloud(
  orderId: string,
  paymentId: string,
  amount: number,
  templateTitle: string
): Promise<void> {
  const path = `payments/${paymentId}`;
  const currentUser = auth.currentUser;
  const userEmail = currentUser?.email || 'guest@onlinewishes.in';
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Guest User';

  const payload = {
    id: paymentId,
    orderId: orderId,
    userEmail: userEmail,
    userName: userName,
    amount: amount,
    currency: 'INR',
    templateTitle: templateTitle,
    paymentGateway: 'Razorpay UPI',
    status: 'SUCCESS',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'payments', paymentId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

