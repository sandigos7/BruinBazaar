import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateUCLAEmail } from '../services/authService';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [validationError, setValidationError] = useState('');
  const { signUp, error, clearError } = useAuth();
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
      alert('Check your email to verify your account!');
      navigate('/login');
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Sign Up - BruinBazaar</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">UCLA Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="you@ucla.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password (min 6 chars)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {(error || validationError) && (
            <p className="text-red-600 text-sm">{error || validationError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-ucla-blue text-white py-2 rounded"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Have an account? <Link to="/login" className="text-ucla-blue">Login</Link>
        </p>
      </div>
    </div>
  );
}