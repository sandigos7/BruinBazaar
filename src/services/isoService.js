/**
 * BruinBazaar ISO (In Search Of) service.
 * Wanted ads - same flow as listings but with "found" instead of "sold".
 * Follows Firebase patterns: where before orderBy, limit 20.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const COLLECTION = 'isos';
const PAGE_SIZE = 20;

/**
 * Get a single ISO post by ID.
 * @param {string} isoId
 * @returns {Promise<object | null>}
 */
export async function getISO(isoId) {
  try {
    const docRef = doc(db, COLLECTION, isoId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('isoService.getISO:', err);
    throw new Error('Failed to fetch ISO post. Please try again.');
  }
}

/**
 * Fetch ISO posts (bulletin board). Optional category filter.
 * @param {object} opts
 * @param {string} [opts.category] - Filter by category or omit for all
 * @param {boolean} [opts.found=false] - Include found (default: active only)
 * @param {import('firebase/firestore').DocumentSnapshot} [opts.startAfterDoc] - For pagination
 * @returns {Promise<object[]>}
 */
export async function getISOs({ category, found = false, startAfterDoc } = {}) {
  try {
    const colRef = collection(db, COLLECTION);
    const constraints = [
      where('found', '==', found),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    ];
    if (category) {
      constraints.unshift(where('category', '==', category));
    }
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('isoService.getISOs:', err);
    throw new Error('Failed to fetch ISO posts. Please try again.');
  }
}

/**
 * Fetch ISO posts by user (for profile).
 * @param {string} userId
 * @param {object} [opts]
 * @param {boolean} [opts.includeFound=true] - Include found posts
 * @param {import('firebase/firestore').DocumentSnapshot} [opts.startAfterDoc]
 * @returns {Promise<object[]>}
 */
export async function getISOsByUser(userId, { includeFound = true, startAfterDoc } = {}) {
  try {
    const colRef = collection(db, COLLECTION);
    const constraints = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    ];
    if (!includeFound) {
      constraints.unshift(where('found', '==', false));
    }
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('isoService.getISOsByUser:', err);
    throw new Error('Failed to fetch your ISO posts. Please try again.');
  }
}

/**
 * Create a new ISO post.
 * @param {object} data - See Firestore schema (userId, sellerName, title, category, etc.)
 * @returns {Promise<object>} Created ISO with id
 */
export async function createISO(data) {
  try {
    const colRef = collection(db, COLLECTION);
    const docData = {
      ...data,
      found: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error('isoService.createISO:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You must be logged in to create an ISO post.');
    }
    throw new Error('Failed to create ISO post. Please try again.');
  }
}

/**
 * Update an ISO post.
 * @param {string} isoId
 * @param {Partial<object>} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateISO(isoId, updates) {
  try {
    const docRef = doc(db, COLLECTION, isoId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('isoService.updateISO:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to edit this ISO post.');
    }
    throw new Error('Failed to update ISO post. Please try again.');
  }
}

/**
 * Mark ISO post as found.
 * @param {string} isoId
 */
export async function markISOFound(isoId) {
  return updateISO(isoId, { found: true });
}

/**
 * Delete an ISO post. Optionally deletes associated Storage photos.
 * @param {string} isoId
 * @param {string} userId - Owner (for Storage path)
 * @param {string[]} [photoUrls] - Storage URLs to delete (optional cleanup)
 */
export async function deleteISO(isoId, userId, photoUrls = []) {
  try {
    const isoDocRef = doc(db, COLLECTION, isoId);

    const batch = writeBatch(db);
    batch.delete(isoDocRef);

    await batch.commit();

    if (photoUrls?.length > 0 && storage) {
      const deletePromises = photoUrls.map((url) => {
        try {
          const path = decodeURIComponent(url.split('/o/')[1]?.split('?')[0] ?? '');
          if (path) {
            const storageRef = ref(storage, path);
            return deleteObject(storageRef);
          }
        } catch {
          // Ignore individual photo delete failures
        }
        return Promise.resolve();
      });
      await Promise.allSettled(deletePromises);
    }
  } catch (err) {
    console.error('isoService.deleteISO:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this ISO post.');
    }
    throw new Error('Failed to delete ISO post. Please try again.');
  }
}
