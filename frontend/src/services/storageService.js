/**
 * BruinBazaar Firebase Storage service.
 * Photo uploads for listings. Compress before upload (max 1MB). Path: listings/{userId}/{photoId}.
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { storage } from '../config/firebase';

const MAX_SIZE_MB = 1;
const LISTINGS_PATH = 'listings';

/**
 * Generate a unique photo ID (cursorrules: Date.now() or UUID).
 * @returns {string}
 */
function generatePhotoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Compress an image to max 1MB (PRD).
 * @param {File} file
 * @returns {Promise<File>}
 */
async function compressImage(file) {
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: /^image\/(jpe?g|png|webp)$/i.test(file.type) ? undefined : 'image/jpeg',
  };
  return imageCompression(file, options);
}

/**
 * Extract Storage path from download URL.
 * Firebase URLs: https://firebasestorage.../o/encodedPath%2F...?alt=media
 * @param {string} url
 * @returns {string | null}
 */
function pathFromURL(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const match = url.match(/\/o\/(.+?)\?/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Upload a listing photo. Compresses to max 1MB, then uploads to listings/{userId}/{photoId}.
 * @param {File} file - Image file
 * @param {string} userId - Owner's Firebase Auth UID
 * @returns {Promise<string>} Download URL
 */
export async function uploadListingPhoto(file, userId) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('File must be an image (JPEG, PNG, or WebP).');
  }
  if (!userId?.trim()) {
    throw new Error('User ID is required to upload photos.');
  }

  try {
    const compressed = await compressImage(file);
    const photoId = generatePhotoId();
    const path = `${LISTINGS_PATH}/${userId.trim()}/${photoId}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, compressed, {
      contentType: compressed.type || 'image/jpeg',
    });

    return getDownloadURL(storageRef);
  } catch (err) {
    console.error('storageService.uploadListingPhoto:', err);
    if (err instanceof Error && !err.code) {
      throw err;
    }
    if (err.code === 'storage/unauthorized') {
      throw new Error('You must be logged in to upload photos.');
    }
    throw new Error('Failed to upload photo. Please try again.');
  }
}

/**
 * Upload multiple listing photos (1-5 per listing, PRD).
 * @param {File[]} files
 * @param {string} userId
 * @returns {Promise<string[]>} Download URLs in order
 */
export async function uploadListingPhotos(files, userId) {
  if (!files?.length || files.length > 5) {
    throw new Error('Please upload 1-5 photos.');
  }
  if (!userId?.trim()) {
    throw new Error('User ID is required to upload photos.');
  }

  const urls = await Promise.all(
    files.map((file) => uploadListingPhoto(file, userId))
  );
  return urls;
}

/**
 * Delete listing photos by their download URLs. Use when listing is deleted.
 * @param {string[]} photoUrls - Download URLs from Firestore
 */
export async function deleteListingPhotos(photoUrls) {
  if (!photoUrls?.length) return;

  const results = await Promise.allSettled(
    photoUrls.map(async (url) => {
      const path = pathFromURL(url);
      if (!path) return;
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    })
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn('storageService.deleteListingPhotos: some deletions failed', failed);
  }
}

/**
 * Get download URL from a Storage path.
 * @param {string} path - e.g. "listings/{userId}/{photoId}"
 * @returns {Promise<string>}
 */
export async function getPhotoURL(path) {
  try {
    if (!path?.trim()) {
      throw new Error('Path is required.');
    }
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  } catch (err) {
    console.error('storageService.getPhotoURL:', err);
    throw new Error('Failed to get photo URL.');
  }
}
