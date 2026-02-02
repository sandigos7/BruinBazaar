import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useState } from 'react';

// Placeholder pages 
function HomePage() {
  const [emojis, setEmojis] = useState([]);
  
  const randomEmojis = ['🐻', '💙', '💛', '🏈', '📚', '🎓', '✨', '🎉', '🔥', '⚡', '🌟', '💫', '🚀', '🎯'];
  
  const spawnEmojis = () => {
    const newEmojis = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      emoji: randomEmojis[Math.floor(Math.random() * randomEmojis.length)],
      left: Math.random() * 80 + 10, // 10-90% from left
      duration: Math.random() * 2 + 2, // 2-4 seconds
    }));
    
    setEmojis(prev => [...prev, ...newEmojis]);
    
    // Remove emojis after animation
    setTimeout(() => {
      setEmojis(prev => prev.filter(e => !newEmojis.find(ne => ne.id === e.id)));
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-ucla-blue to-blue-700 relative overflow-hidden">
      {/* Floating emojis */}
      {emojis.map(({ id, emoji, left, duration }) => (
        <div
          key={id}
          className="absolute text-4xl pointer-events-none animate-float"
          style={{
            left: `${left}%`,
            bottom: '10%',
            animation: `float ${duration}s ease-out forwards`,
          }}
        >
          {emoji}
        </div>
      ))}

      <div className="text-center z-10">
        <h1 className="text-5xl font-bold text-white mb-4">
          🎉 You've Logged In! 🎉
        </h1>
        <p className="text-xl text-ucla-gold mb-8 max-w-md">
          Eventually an epic UCLA marketplace will be here!
        </p>
        <p className="text-white mb-8 opacity-80">
          But for now...
        </p>
        
        <button
          onClick={spawnEmojis}
          className="bg-ucla-gold text-ucla-blue font-bold py-4 px-8 rounded-lg text-xl hover:bg-yellow-300 transform hover:scale-105 transition-all shadow-lg"
        >
          Click for Magic ✨
        </button>
        
        <p className="text-white text-sm mt-8 opacity-60">
          (Your designer is cooking up something amazing in Figma)
        </p>
      </div>
    </div>
  );
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