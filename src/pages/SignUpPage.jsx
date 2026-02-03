import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateUCLAEmail } from '../services/authService';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { signUp, sendEmailVerification, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (!validateUCLAEmail(email)) {
      setValidationError('Please use a UCLA email (@ucla.edu or @g.ucla.edu)');
      return;
    }

    try {
      await signUp(email, password, { displayName });
      setVerificationSent(true);
    } catch (err) {
      // Error handled by context
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification();
      alert('Verification email resent!'); // Temporary - could make this inline too
    } catch (err) {
      // Error handled
    }
  };

  // Show success state after signup
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-ucla-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">We sent a verification link to:</p>
            <p className="font-semibold text-ucla-blue mt-1">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Next steps:</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
              <li>Open your UCLA email inbox</li>
              <li>Click the verification link</li>
              <li>Return here and log in</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-ucla-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Login
            </button>

            <button
              onClick={handleResendVerification}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Resend Verification Email
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            Didn't receive the email? Check your spam folder or try resending.
          </p>
        </div>
      </div>
    );
  }

  // Normal signup form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">Join the BruinBazaar marketplace</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucla-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">UCLA Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucla-blue"
              placeholder="you@ucla.edu"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must be @ucla.edu or @g.ucla.edu</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ucla-blue"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {(error || validationError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error || validationError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-ucla-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-ucla-blue font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}