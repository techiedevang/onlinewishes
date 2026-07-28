import {
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CustomWebsiteRequest } from '../types';

const LOCAL_STORAGE_KEY = 'onlinewishes_custom_requests';

// Initial sample custom requests so Admin Dashboard always has sample data to demonstrate
export const INITIAL_SAMPLE_REQUESTS: CustomWebsiteRequest[] = [
  {
    id: 'req_sample_101',
    recipientName: 'Aarav',
    relationship: 'Boyfriend',
    clientPrompt: 'I want a retro 8-bit cyberpunk theme for my boyfriend with custom high score quiz and neon romantic sunset memory wall.',
    whatsappNumber: '+91 9876543210',
    requestedSlug: 'aarav-cyber-love',
    status: 'PENDING',
    createdAt: '2026-07-28 04:30',
    userEmail: 'sneha.k@gmail.com',
    estimatedPrice: 300,
    aiBlueprintTitle: 'Aarav\'s Cyberpunk Love Quest',
    audioDuration: 18,
  },
  {
    id: 'req_sample_102',
    recipientName: 'Meera',
    relationship: 'Sister',
    clientPrompt: 'Chic Vogue style editorial website for my sister with 25 photo cards, jazz background music, and a custom sisterhood promises list.',
    whatsappNumber: '+91 9123456789',
    requestedSlug: 'meera-vogue',
    status: 'CONTACTED',
    createdAt: '2026-07-27 18:15',
    userEmail: 'rohit.v@gmail.com',
    estimatedPrice: 300,
    aiBlueprintTitle: 'Meera\'s Editorial Sisterhood Magazine',
  }
];

export async function saveCustomWebsiteRequest(
  requestInput: Omit<CustomWebsiteRequest, 'id' | 'createdAt' | 'status'>
): Promise<CustomWebsiteRequest> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newRequest: CustomWebsiteRequest = {
    ...requestInput,
    id: requestId,
    status: 'PENDING',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  // 1. Save to localStorage
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existingList: CustomWebsiteRequest[] = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.unshift(newRequest);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingList));
  } catch (e) {
    console.error('Failed to save request to localStorage:', e);
  }

  // 2. Save to Firestore
  try {
    await setDoc(doc(db, 'custom_requests', requestId), newRequest, { merge: true });
  } catch (e) {
    console.warn('Firestore write failed, request saved locally:', e);
  }

  return newRequest;
}

export async function getCustomWebsiteRequests(): Promise<CustomWebsiteRequest[]> {
  let list: CustomWebsiteRequest[] = [];

  // 1. Try reading local storage
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      list = JSON.parse(localRaw);
    }
  } catch (e) {
    console.error('Failed to parse local custom requests:', e);
  }

  // If local list is empty, populate initial sample
  if (list.length === 0) {
    list = [...INITIAL_SAMPLE_REQUESTS];
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  // 2. Try fetching Firestore requests
  try {
    const snap = await getDocs(collection(db, 'custom_requests'));
    if (!snap.empty) {
      const firestoreList: CustomWebsiteRequest[] = [];
      snap.forEach((docSnap) => {
        firestoreList.push(docSnap.data() as CustomWebsiteRequest);
      });

      // Merge firestore items with local list, avoiding duplicates
      const map = new Map<string, CustomWebsiteRequest>();
      list.forEach((item) => map.set(item.id, item));
      firestoreList.forEach((item) => map.set(item.id, item));
      list = Array.from(map.values());
    }
  } catch (e) {
    console.warn('Firestore fetch custom requests failed, using local list:', e);
  }

  // Sort descending by date
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateCustomRequestStatus(
  requestId: string,
  newStatus: CustomWebsiteRequest['status']
): Promise<void> {
  // Update local storage
  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      const list: CustomWebsiteRequest[] = JSON.parse(localRaw);
      const updated = list.map((item) => (item.id === requestId ? { ...item, status: newStatus } : item));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to update local status:', e);
  }

  // Update Firestore
  try {
    await updateDoc(doc(db, 'custom_requests', requestId), { status: newStatus });
  } catch (e) {
    console.warn('Firestore status update failed:', e);
  }
}

export const fetchCustomWebsiteRequests = getCustomWebsiteRequests;
export const updateCustomWebsiteRequestStatus = updateCustomRequestStatus;

