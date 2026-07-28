import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase';

export async function uploadImageToStorage(file: File, scrapbookId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to upload photos securely.');
  }

  // Create isolated directory path: user_uid/scrapbook_id/timestamp_filename
  const extension = file.name.split('.').pop();
  const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const filePath = `users/${auth.currentUser.uid}/${scrapbookId}/${safeFilename}`;
  
  const storageRef = ref(storage, filePath);
  
  // Upload file
  await uploadBytes(storageRef, file, {
    cacheControl: 'public, max-age=31536000',
  });
  
  // Get and return the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
