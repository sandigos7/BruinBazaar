import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Placeholder pages (you'll build these next)
function HomePage() {
  return <div className="p-4">Home - Bulletin Board</div>;
}

function SearchPage() {
  return <div className="p-4">Search</div>;
}

function CreatePage() {
  return <div className="p-4">Create Listing</div>;
}

function MessagesPage() {
  return <div className="p-4">Messages</div>;
}

function ProfilePage() {
  return <div className="p-4">Profile</div>;
}

function LoginPage() {
  return <div className="p-4">Login</div>;
}

function SignUpPage() {
  return <div className="p-4">Sign Up</div>;
}

// Protected route wrapper (requires auth + email verification per PRD)
function ProtectedRoute({ children }) {
  const { user, loading, isEmailVerified } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Email Verification Required</h2>
          <p>Please check your email and verify your account to continue.</p>
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
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePage />
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

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;