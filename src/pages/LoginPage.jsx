import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// UCLA campus background — replace with local asset once Figma CDN expires
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
    margin: '0 0 24px',
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
    transition: 'background 0.15s',
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
};

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
      // handled by context
    }
  };

  const focusStyle = (e) => (e.target.style.borderColor = '#2774ae');
  const blurStyle = (e) => (e.target.style.borderColor = '#ebebeb');

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
          <h2 style={styles.cardTitle}>Login to your account</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={styles.label}>Email or username</label>
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="Enter your @ucla.edu email"
                required
                style={styles.input}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div style={{ marginBottom: 6 }}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                placeholder="Enter your password"
                required
                style={styles.input}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: 12, color: '#000', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}
              >
                Forgot password?
              </Link>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              style={styles.btnPrimary}
              onMouseOver={(e) => (e.target.style.background = '#1d5a8a')}
              onMouseOut={(e) => (e.target.style.background = '#2774ae')}
            >
              Sign In
            </button>
          </form>

          <p style={{ fontSize: 10, color: '#1e1e1e', textAlign: 'center', marginTop: 16, fontWeight: 600 }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{ color: '#1e1e1e', textDecoration: 'underline', fontWeight: 600 }}
            >
              Sign up with your @ucla.edu email
            </Link>
          </p>

          <p style={{ fontSize: 9, color: '#858585', textAlign: 'center', marginTop: 10, lineHeight: 1.5, fontWeight: 600 }}>
            Secure login for @ucla.edu accounts only. By logging in, you agree to our{' '}
            <Link to="/terms" style={{ color: '#2774ae', textDecoration: 'underline' }}>
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}