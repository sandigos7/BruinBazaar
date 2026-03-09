/**
 * BruinBazaar auth service.
 * Firebase Auth (email/password) + Firestore user profile.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UCLA_EMAIL_REGEX } from '../constants/auth';

/**
 * Validates that the email is a UCLA domain (@ucla.edu or @g.ucla.edu).
 * @param {string} email
 * @returns {boolean}
 */
export function validateUCLAEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return UCLA_EMAIL_REGEX.test(email.trim());
}

/**
 * Sign up with email/password. Validates UCLA domain, creates Auth user,
 * sends verification email, and creates Firestore user profile.
 * @param {string} email - UCLA email
 * @param {string} password
 * @param {{ displayName: string, year?: string, major?: string }} profile
 * @returns {Promise<import('firebase/auth').User>}
 */
export async function signUp(email, password, profile = {}) {
  const trimmedEmail = email?.trim();
  if (!validateUCLAEmail(trimmedEmail)) {
    throw new Error('Please use a valid UCLA email (@ucla.edu or @g.ucla.edu)');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const { displayName = '', year = '', major = '' } = profile;
  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
  const user = userCredential.user;

  await firebaseSendEmailVerification(user);

  await createUserProfile(user.uid, {
    uid: user.uid,
    email: user.email,
    displayName: displayName.trim() || user.email?.split('@')[0] || 'User',
    year: year.trim() || '',
    major: major.trim() || '',
    createdAt: serverTimestamp(),
    emailVerified: false,
  });

  return user;
}

/**
 * Sign in with email/password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').User>}
 */
export async function signIn(email, password) {
  const trimmedEmail = email?.trim();
  if (!trimmedEmail || !password) {
    throw new Error('Email and password are required');
  }
  const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
  return userCredential.user;
}

/**
 * Sign out current user.
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Send email verification link to the current user.
 * @returns {Promise<void>}
 */
export async function sendEmailVerification() {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in to send a verification email');
  await firebaseSendEmailVerification(user);
}

/**
 * Send password reset email. Validates UCLA domain.
 * @param {string} email - UCLA email
 */
export async function sendPasswordReset(email) {
  const trimmedEmail = email?.trim();
  if (!validateUCLAEmail(trimmedEmail)) {
    throw new Error('Please use a valid UCLA email (@ucla.edu or @g.ucla.edu)');
  }
  await firebaseSendPasswordResetEmail(auth, trimmedEmail);
}

/**
 * Create Firestore user profile (used on signup).
 * @param {string} uid
 * @param {object} data - { uid, email, displayName, year, major, createdAt, emailVerified }
 */
export async function createUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data);
}

/**
 * Get Firestore user profile. Returns null if not found.
 * @param {string} uid
 * @returns {Promise<object | null>}
 */
export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get or create Firestore user profile. Creates minimal doc if missing (e.g. legacy user).
 * @param {string} uid
 * @param {import('firebase/auth').User} [authUser] - Optional auth user for fallback data
 * @returns {Promise<object>}
 */
export async function getOrCreateUserProfile(uid, authUser = null) {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const fallback = {
    uid,
    email: authUser?.email ?? '',
    displayName: authUser?.displayName ?? authUser?.email?.split('@')[0] ?? 'User',
    year: '',
    major: '',
    createdAt: serverTimestamp(),
    emailVerified: authUser?.emailVerified ?? false,
  };
  await createUserProfile(uid, fallback);
  const created = await getUserProfile(uid);
  return created ?? { id: uid, ...fallback };
}

/**
 * Update Firestore user profile (name, year, major).
 * @param {string} uid
 * @param {{ displayName?: string, year?: string, major?: string }} updates
 */
export async function updateUserProfile(uid, updates) {
  const ref = doc(db, 'users', uid);
  const allowed = {};
  if (updates.displayName !== undefined) allowed.displayName = String(updates.displayName).trim();
  if (updates.year !== undefined) allowed.year = String(updates.year).trim();
  if (updates.major !== undefined) allowed.major = String(updates.major).trim();
  if (Object.keys(allowed).length === 0) return;
  await updateDoc(ref, { ...allowed, updatedAt: serverTimestamp() });
}

/**
 * Subscribe to auth state changes.
 * @param {(user: import('firebase/auth').User | null) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
  return firebaseOnAuthStateChanged(auth, callback);
}
