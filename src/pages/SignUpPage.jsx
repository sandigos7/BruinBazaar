import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateUCLAEmail } from '../services/authService';

const BG_IMAGE = 'https://www.figma.com/api/mcp/asset/fed63983-c0a4-4735-ad69-b7ffde3bcab8';

const styles = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    maxWidth: 480,
    margin: '0 auto',
    overflow: 'hidden',
    backgroundColor: '#1a2a3a',
    fontFamily: 'Inter, sans-serif',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${BG_IMAGE})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.50)',
    zIndex: 1,
  },
  inner: {
    position: 'relative',
    zIndex: 2,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    padding: '48px 28px 0',
    flex: 1,
  },
  logo: {
    fontFamily: "'Jomhuria', serif",
    fontSize: 72,
    color: '#fff',
    lineHeight: 1,
    margin: '0 0 12px',
    display: 'block',
  },
  tagline: {
    fontFamily: "'Jost', sans-serif",
    fontSize: 26,
    fontWeight: 400,
    color: '#fff',
    lineHeight: 1.3,
    margin: 0,
  },
  card: {
    background: '#fff',
    borderRadius: '32px 32px 0 0',
    padding: '28px 24px 40px',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e1e1e',
    textAlign: 'center',
    margin: '0 0 20px',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#1e1e1e',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 44,
    background: '#f2f2f2',
    border: '0.8px solid #ebebeb',
    borderRadius: 10,
    padding: '0 12px',
    fontSize: 13,
    color: '#1e1e1e',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s',
  },
  btnPrimary: {
    width: '100%',
    height: 46,
    background: '#2774ae',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    marginTop: 4,
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  termsText: {
    fontSize: 9,
    color: '#858585',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 1.5,
    fontWeight: 600,
  },
};

const focusStyle = (e) => (e.target.style.borderColor = '#2774ae');
const blurStyle = (e) => (e.target.style.borderColor = '#ebebeb');

// ─── Step 1: Account details ──────────────────────────────────────────────────
function StepForm({ onNext }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const { signUp, error, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (!validateUCLAEmail(email)) {
      setLocalError('Must be a @ucla.edu or @g.ucla.edu email.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await signUp(email, password, { displayName: fullName });
      onNext(email);
    } catch (err) {
      // handled by context
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Enter your full name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Joe Bruin"
          required
          style={styles.input}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Enter your UCLA email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearError(); }}
          placeholder="e.g. joebruin@g.ucla.edu"
          required
          style={styles.input}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={styles.label}>Create a password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          required
          style={styles.input}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Confirm your password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          required
          style={styles.input}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>

      {displayError && <div style={styles.error}>{displayError}</div>}

      <button type="submit" style={styles.btnPrimary}>Continue</button>

      <p style={styles.termsText}>
        Secure login for @ucla.edu accounts only. By creating an account, you agree to our{' '}
        <Link to="/terms" style={{ color: '#2774ae', textDecoration: 'underline' }}>Terms of Service</Link>.
      </p>
    </form>
  );
}

// Step 2 removed - Firebase handles email verification via link, not code
// Step 3 (Profile setup) removed - can be added as optional onboarding after email verification

// ─── Main SignUpPage ──────────────────────────────────────────────────────────
export default function SignUpPage() {
  const navigate = useNavigate();

  // After account creation, redirect to home
  // ProtectedRoute will show email verification screen
  const handleFormNext = () => {
    navigate('/');
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={styles.overlay} />

      <div style={styles.inner}>
        {/* Hero */}
        <div style={styles.hero}>
          <span style={styles.logo}>Bruin Bazaar</span>
          <p style={styles.tagline}>The UCLA Student{'\n'}Marketplace.</p>
        </div>

        {/* Bottom card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create your account</h2>

          <StepForm onNext={handleFormNext} />

          <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 16 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2774ae', fontWeight: 600, textDecoration: 'none' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}