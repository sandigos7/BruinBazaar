/**
 * Hook to access auth context.
 * Throws if used outside AuthProvider.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * @returns {{
 *   user: import('firebase/auth').User | null,
 *   userProfile: object | null,
 *   loading: boolean,
 *   error: string | null,
 *   isEmailVerified: boolean,
 *   signUp: (email: string, password: string, profile?: object) => Promise<void>,
 *   signIn: (email: string, password: string) => Promise<void>,
 *   signOut: () => Promise<void>,
 *   sendPasswordReset: (email: string) => Promise<void>,
 *   sendEmailVerification: () => Promise<void>,
 *   updateProfile: (updates: object) => Promise<void>,
 *   clearError: () => void,
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context == null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
