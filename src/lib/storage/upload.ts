'use client';

import { ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param storage The Firebase Storage instance.
 * @param file The file to upload.
 * @param userId The ID of the user uploading the file.
 * @param path The base path for the upload (e.g., 'user-uploads').
 * @returns Promise<string> The public URL of the uploaded file.
 */
export async function uploadFile(
    storage: FirebaseStorage, 
    file: File, 
    userId: string, 
    path: string = 'user-uploads'
): Promise<string> {
  if (!file || !userId) {
    throw new Error('File and user ID are required for upload.');
  }

  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const storageRef = ref(storage, `${path}/${userId}/${fileId}-${file.name}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed.');
  }
}
