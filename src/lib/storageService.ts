import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export async function uploadImageToStorage(file: File, scrapbookId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string;
        const extension = file.name.split('.').pop() || 'jpg';
        
        // Ensure image is reasonable size for Firestore
        // We rely on CustomizerStudio's imageCompression
        
        // Generate a unique ID for the document
        const imageId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        
        const docRef = doc(db, 'uploaded_images', imageId);
        
        await setDoc(docRef, {
          scrapbookId: scrapbookId,
          data: base64Data,
          contentType: file.type || 'image/jpeg',
          uploadedBy: auth.currentUser?.uid || 'anonymous',
          createdAt: Date.now()
        });
        
        // We construct a URL that our Express server will intercept
        resolve(`/api/images/${imageId}`);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function uploadAudioToStorage(file: File, scrapbookId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 800 * 1024) {
      reject(new Error("Audio file too large. Please select a file under 800KB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string;
        
        const audioId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        const docRef = doc(db, 'uploaded_images', audioId); // reuse the same collection for simplicity
        
        await setDoc(docRef, {
          scrapbookId: scrapbookId,
          data: base64Data,
          contentType: file.type || 'audio/mpeg',
          uploadedBy: auth.currentUser?.uid || 'anonymous',
          createdAt: Date.now()
        });
        
        resolve(`/api/images/${audioId}`); // the API endpoint just returns the data with the right content-type
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
