/**
 * BruinBazaar users service.
 * Firestore profile operations. Auth creates profile on signup.
 */

import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'users';

/**
 * Get a user profile by ID.
 * @param {string} userId
 * @returns {Promise<object | null>}
 */
export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, COLLECTION, userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('usersService.getUserProfile:', err);
    throw new Error('Failed to fetch user profile. Please try again.');
  }
}

/**
 * Update user profile (displayName, year, major).
 * @param {string} userId
 * @param {{ displayName?: string, year?: string, major?: string }} updates
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, updates) {
  try {
    const docRef = doc(db, COLLECTION, userId);
    const allowed = {};
    if (updates.displayName !== undefined) allowed.displayName = String(updates.displayName).trim();
    if (updates.year !== undefined) allowed.year = String(updates.year).trim();
    if (updates.major !== undefined) allowed.major = String(updates.major).trim();
    if (Object.keys(allowed).length === 0) return;
    await updateDoc(docRef, { ...allowed, updatedAt: serverTimestamp() });
  } catch (err) {
    console.error('usersService.updateUserProfile:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to update this profile.');
    }
    throw new Error('Failed to update profile. Please try again.');
  }
}

/**
 * Create user profile (called from authService on signup).
 * @param {string} userId
 * @param {object} data - { uid, email, displayName, year, major, createdAt, emailVerified }
 * @returns {Promise<void>}
 */
export async function createUserProfile(userId, data) {
  try {
    const docRef = doc(db, COLLECTION, userId);
    await setDoc(docRef, data);
  } catch (err) {
    console.error('usersService.createUserProfile:', err);
    throw new Error('Failed to create profile. Please try again.');
  }
}

/**
 * Delete user profile (e.g. account deletion flow).
 * @param {string} userId
 * @returns {Promise<void>}
 */
export async function deleteUserProfile(userId) {
  try {
    const docRef = doc(db, COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('usersService.deleteUserProfile:', err);
    if (err.code === 'permission-denied') {
      throw new Error('You do not have permission to delete this profile.');
    }
    throw new Error('Failed to delete profile. Please try again.');
  }
}
