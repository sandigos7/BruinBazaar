import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Background image placeholder (full screen) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'var(--login-hero-image, linear-gradient(135deg, #1e3a5f 0%, #2774AE 50%, #1e3a5f 100%))',
        }}
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero content at top */}
        <header className="pt-10 sm:pt-12 px-6 text-center">
          <h1 className="font-brand text-4xl sm:text-5xl text-white tracking-wide drop-shadow-sm">
            Bruin Bazaar
          </h1>
          <p className="text-white/95 text-base sm:text-lg mt-1 font-medium">
            The UCLA Student Marketplace.
          </p>
        </header>

        {/* Pagination dots (above the sheet) */}
        <div className="mt-auto mb-3 flex justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white" aria-current="step" />
          <span className="w-2 h-2 rounded-full border-2 border-white/80 bg-transparent" />
          <span className="w-2 h-2 rounded-full border-2 border-white/80 bg-transparent" />
        </div>

        {/* Login card (bottom sheet) */}
        <main className="px-0 sm:px-6 pb-0">
          <div className="w-full sm:max-w-md sm:mx-auto bg-white rounded-t-3xl rounded-b-none sm:rounded-[40px] shadow-2xl shadow-black/15 overflow-hidden">
            <div className="p-5 sm:p-7 pb-6 sm:pb-7">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4">
              Login to your account
            </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
                  Email or username
                </label>
                <input
                  id="email"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your @ucla.edu email"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ucla-blue focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ucla-blue focus:border-transparent transition"
                  required
                />
                <div className="mt-1.5 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-ucla-blue font-medium hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-ucla-blue text-white py-3 rounded-2xl font-semibold hover:bg-[#1d5a8a] active:bg-[#164a75] transition focus:outline-none focus:ring-2 focus:ring-ucla-blue focus:ring-offset-2"
              >
                Sign In
              </button>
              </form>

              <p className="mt-4 text-center text-gray-700 text-[0.65rem]">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-ucla-blue font-medium hover:underline underline-offset-2"
              >
                Sign up with your @ucla.edu email
              </Link>
            </p>

              <p className="mt-4 text-center text-gray-600 text-xs leading-relaxed max-w-sm mx-auto">
              Secure login for @ucla.edu accounts only. By logging in, you agree to our{' '}
              <Link
                to="/terms"
                className="text-ucla-blue font-medium hover:underline underline-offset-2"
              >
                Terms of Service.
              </Link>
            </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
