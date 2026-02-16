import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CreateListing from './pages/CreateListing';
import ProfileSetupPage from './pages/ProfileSetupPage';


function SearchPage() {
  return <div className="p-4">Search</div>;
}

function MessagesPage() {
  return <div className="p-4">Messages</div>;
}

// Protected route — requires auth + email verification
function ProtectedRoute({ children }) {
  const { user, loading, isEmailVerified, sendEmailVerification } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    if (!user || isEmailVerified) return;

    const checkVerification = async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Failed to check verification:', err);
      }
    };

    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [user, isEmailVerified]);

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        window.location.reload();
      } else {
        setTimeout(() => setChecking(false), 1000);
      }
    } catch (err) {
      console.error('Failed to check verification:', err);
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      await sendEmailVerification();
      setResendSuccess(true);
    } catch (err) {
      console.error('Failed to resend email:', err);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-ucla-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-2">
            We sent a verification link to:
          </p>
          <p className="text-sm font-semibold text-ucla-blue mb-6">
            {user.email}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in the email to verify your account. This page will automatically refresh when verified.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCheckNow}
              disabled={checking}
              className="w-full bg-ucla-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? 'Checking...' : 'I Verified — Check Now'}
            </button>
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            {resendSuccess && (
              <p className="text-sm text-green-600">Email sent! Check your inbox.</p>
            )}
            <button
              onClick={() => { window.location.href = '/login'; }}
              className="w-full text-gray-500 px-6 py-2 rounded-lg text-sm hover:text-gray-700 transition"
            >
              Sign Out
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Didn't receive it? Check your spam folder or click resend above.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />


        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;