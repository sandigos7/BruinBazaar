/**
 * Auth context: Firebase Auth state + Firestore user profile.
 * Users cannot access app features until email is verified (PRD).
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  sendPasswordReset as authSendPasswordReset,
  sendEmailVerification as authSendEmailVerification,
  updateUserProfile as authUpdateUserProfile,
  getOrCreateUserProfile,
  onAuthStateChanged,
} from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await getOrCreateUserProfile(authUser.uid, authUser);
        setUserProfile(profile);
      } catch (err) {
        console.error('AuthContext: failed to load user profile', err);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password, profile) => {
    setError(null);
    try {
      await authSignUp(email, password, profile);
    } catch (err) {
      const message =
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered. Try signing in.'
          : err.code === 'auth/weak-password'
            ? 'Password must be at least 6 characters.'
            : err.message || 'Sign up failed. Please try again.';
      setError(message);
      throw err;
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      await authSignIn(email, password);
    } catch (err) {
      const message =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : err.code === 'auth/user-not-found'
            ? 'No account found with this email.'
            : err.message || 'Sign in failed. Please try again.';
      setError(message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authSignOut();
    } catch (err) {
      setError(err.message || 'Sign out failed.');
      throw err;
    }
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    setError(null);
    try {
      await authSendPasswordReset(email);
    } catch (err) {
      const message =
        err.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : err.message || 'Password reset failed. Please try again.';
      setError(message);
      throw err;
    }
  }, []);

  const sendEmailVerification = useCallback(async () => {
    setError(null);
    try {
      await authSendEmailVerification();
    } catch (err) {
      setError(err.message || 'Failed to send verification email.');
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user?.uid) return;
    setError(null);
    try {
      await authUpdateUserProfile(user.uid, updates);
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      throw err;
    }
  }, [user?.uid]);

  const value = {
    user,
    userProfile,
    loading,
    error,
    isEmailVerified: user?.emailVerified ?? false,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    sendEmailVerification,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
