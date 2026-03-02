/**
 * BruinBazaar — Profile Setup (Onboarding step)
 * Matches Figma node 99:619 "Profile Onboarding"
 * Shown after email verification on first login when year/major are empty.
 * Allows profile photo upload, major entry, and grad year selection.
 * All fields optional — user can skip and fill later from ProfilePage.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/usersService';
import { YEAR_OPTIONS } from '../constants/auth';

// UCLA campus hero image (Royce Hall) — Figma asset
const HERO_IMG = 'https://www.figma.com/api/mcp/asset/8262871d-5a91-4427-ac06-75c54e86582a';

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

// ─── Avatar Picker ────────────────────────────────────────────────────────────

function AvatarPicker({ preview, onChange }) {
  const inputRef = useRef();

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Banner background */}
      <div
        style={{
          width: '100%',
          height: 110,
          background: '#F1F5F9',
          borderRadius: '9px 9px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: '50%',
              background: '#E2E8F0',
              overflow: 'hidden',
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              // Default person silhouette matching Figma
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="22" r="13" fill="#94A3B8" />
                <ellipse cx="30" cy="52" rx="22" ry="14" fill="#94A3B8" />
              </svg>
            )}
          </div>
          {/* + badge */}
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              position: 'absolute',
              bottom: 4,
              right: 0,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#fff',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <span className="material-icons" style={{ fontSize: 14, color: '#475569' }}>add</span>
          </button>
        </div>
        {/* Edit pencil top-right */}
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span className="material-icons" style={{ fontSize: 16, color: '#475569' }}>edit</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
  const { user, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [major, setMajor] = useState(userProfile?.major || '');
  const [gradYear, setGradYear] = useState(userProfile?.year || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Update Firestore profile with major + year
      const updates = {};
      if (major.trim()) updates.major = major.trim();
      if (gradYear) updates.year = gradYear;

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }

      // Avatar upload is a future enhancement (requires Storage path for avatars/{uid})
      // For now, navigate to home on completion

      navigate('/', { replace: true });
    } catch (err) {
      console.error('ProfileSetupPage submit:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero background — UCLA campus */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={HERO_IMG}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            width: '200%',
            top: '-3%',
            left: '-38%',
            objectFit: 'cover',
          }}
        />
        {/* Darken overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.52)',
          }}
        />
      </div>

      {/* Brand text over hero */}
      <div
        style={{
          position: 'absolute',
          top: 42,
          left: 0,
          width: '100%',
          maxWidth: 480,
          padding: '0 37px',
          boxSizing: 'border-box',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'Jomhuria, serif',
            fontSize: 88,
            color: '#fff',
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          Bruin Bazaar
        </div>
        <div
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: 28,
            color: '#fff',
            lineHeight: 1.3,
            fontWeight: 400,
          }}
        >
          The UCLA Student Marketplace.
        </div>
      </div>

      {/* White card sheet */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: '40px 40px 0 0',
          paddingBottom: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Title */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 22,
            color: '#1E1E1E',
            marginTop: 28,
            marginBottom: 20,
          }}
        >
          Create your account
        </p>

        {/* Avatar + banner picker */}
        <div style={{ width: 'calc(100% - 26px)', marginBottom: 20, position: 'relative' }}>
          <AvatarPicker preview={avatarPreview} onChange={handleAvatarChange} />
        </div>

        {/* Photo/banner prompt */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 18,
              color: '#000',
            }}
          >
            Add a profile photo and banner
          </p>
          <button
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#858585',
              fontWeight: 500,
              padding: '2px 8px',
            }}
          >
            Or add later
          </button>
        </div>

        {/* Major + grad year */}
        <div style={{ width: '100%', padding: '0 13px', boxSizing: 'border-box', marginBottom: 16 }}>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              color: '#1E1E1E',
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Add your major and graduation year
          </p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Major input */}
            <input
              type="text"
              placeholder="e.g. Business Economics"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              style={{
                flex: 1,
                height: 41,
                background: '#F2F2F2',
                border: '0.75px solid #EBEBEB',
                borderRadius: 9,
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                color: '#1E1E1E',
                padding: '0 8px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* Grad year dropdown */}
            <div style={{ position: 'relative', flexShrink: 0, width: 126 }}>
              <select
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                style={{
                  width: '100%',
                  height: 41,
                  background: '#F2F2F2',
                  border: '0.75px solid #EBEBEB',
                  borderRadius: 9,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  color: gradYear ? '#1E1E1E' : '#858585',
                  padding: '0 32px 0 8px',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select grad year</option>
                {GRAD_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span
                className="material-icons"
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: '#858585',
                  pointerEvents: 'none',
                }}
              >
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            color: '#858585',
            textAlign: 'center',
            width: 340,
            lineHeight: 1.5,
            marginBottom: 24,
            padding: '0 13px',
            boxSizing: 'border-box',
          }}
        >
          Tip: Add a profile photo, major, and graduation year to improve credibility
        </p>

        {/* Error */}
        {error && (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: '#EF4444',
              textAlign: 'center',
              marginBottom: 12,
              padding: '0 20px',
            }}
          >
            {error}
          </p>
        )}

        {/* Create Account CTA */}
        <div style={{ width: 'calc(100% - 26px)', padding: '0 0 4px' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              height: 41,
              background: loading ? '#94A3B8' : '#2774AE',
              border: 'none',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.15s',
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Saving...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        {/* ToS */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: 9,
            color: '#858585',
            textAlign: 'center',
            marginTop: 12,
            padding: '0 20px',
            lineHeight: 1.5,
          }}
        >
          Secure login for @ucla.edu accounts only. By creating an account, you agree to our{' '}
          <span style={{ color: '#2774AE', textDecoration: 'underline', cursor: 'pointer' }}>
            Terms of Service
          </span>
          .
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}