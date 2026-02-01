/**
 * BruinBazaar listings service.
 * CRUD for marketplace listings. Follows Firebase patterns: where before orderBy, limit 20.
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

const COLLECTION = 'listings';
const PAGE_SIZE = 20;

/**
 * Get a single listing by ID.
 * @param {string} listingId
 * @returns {Promise<object | null>}
 */
export async function getListing(listingId) {
  try {
    const docRef = doc(db, COLLECTION, listingId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('listingsService.getListing:', err);
    throw new Error('Failed to fetch listing. Please try again.');
  }
}

/**
 * Fetch listings (bulletin board). Optional category filter.
 * @param {object} opts
 * @param {string} [opts.category] - Filter by category or omit for all
 * @param {boolean} [opts.sold=false] - Include sold (default: active only)
 * @param {import('firebase/firestore').DocumentSnapshot} [opts.startAfterDoc] - For pagination
 * @returns {Promise<object[]>}
 */
export async function getListings({ category, sold = false, startAfterDoc } = {}) {
  try {
    const colRef = collection(db, COLLECTION);
    const constraints = [
      where('sold', '==', sold),
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
    console.error('listingsService.getListings:', err);
    throw new Error('Failed to fetch listings. Please try again.');
  }
}

/**
 * Fetch listings by user (for profile "My Listings").
 * @param {string} userId
 * @param {object} [opts]
 * @param {boolean} [opts.includeSold=true] - Include sold listings
 * @param {import('firebase/firestore').DocumentSnapshot} [opts.startAfterDoc]
 * @returns {Promise<object[]>}
 */
export async function getListingsByUser(userId, { includeSold = true, startAfterDoc } = {}) {
  try {
    const colRef = collection(db, COLLECTION);
    const constraints = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    ];
    if (!includeSold) {
      constraints.unshift(where('sold', '==', false));
    }
    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('listingsService.getListingsByUser:', err);
    throw new Error('Failed to fetch your listings. Please try again.');
  }
}

/**
 * Create a new listing.
 * @param {object} data - See Firestore schema (userId, sellerName, title, etc.)
 * @returns {Promise<object>} Created listing with id
 */
export async function createListing(data) {
  try {
    const colRef = collection(db, COLLECTION);
    const docData = {
      ...data,
      sold: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error('listingsService.createListing:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You must be logged in to create a listing.');
    }
    throw new Error('Failed to create listing. Please try again.');
  }
}

/**
 * Update a listing.
 * @param {string} listingId
 * @param {Partial<object>} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateListing(listingId, updates) {
  try {
    const docRef = doc(db, COLLECTION, listingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('listingsService.updateListing:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to edit this listing.');
    }
    throw new Error('Failed to update listing. Please try again.');
  }
}

/**
 * Mark listing as sold.
 * @param {string} listingId
 */
export async function markListingSold(listingId) {
  return updateListing(listingId, { sold: true });
}

/**
 * Delete a listing. Optionally deletes associated Storage photos.
 * @param {string} listingId
 * @param {string} userId - Owner (for Storage path)
 * @param {string[]} [photoUrls] - Storage URLs to delete (optional cleanup)
 */
export async function deleteListing(listingId, userId, photoUrls = []) {
  try {
    const listingDocRef = doc(db, COLLECTION, listingId);

    const batch = writeBatch(db);
    batch.delete(listingDocRef);

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
    console.error('listingsService.deleteListing:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this listing.');
    }
    throw new Error('Failed to delete listing. Please try again.');
  }
}
