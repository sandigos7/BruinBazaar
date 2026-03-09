import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSkip = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Upload photo to Firebase Storage
      // For now, just update the profile with major and gradYear
      await updateProfile({ major, gradYear });
      navigate('/');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ background: '#2774ae', padding: '44px 20px 24px' }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#fff',
          margin: 0,
          textAlign: 'center',
        }}>
          Complete Your Profile
        </h1>
        <p style={{
          fontSize: 14,
          color: '#e0f2fe',
          textAlign: 'center',
          margin: '8px 0 0',
        }}>
          Help others know who you are
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '24px 20px' }}>
        {/* Photo Upload */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          textAlign: 'center',
        }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: photoPreview ? 'transparent' : '#f1f5f9',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span className="material-icons" style={{ fontSize: 48, color: '#94a3b8' }}>
                person
              </span>
            )}
            <div style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#2774ae',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <span className="material-icons" style={{ fontSize: 18, color: '#fff' }}>
                add_a_photo
              </span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Add a profile photo
          </p>
        </div>

        {/* Major & Grad Year */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 8,
            }}>
              Major
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
              style={{
                width: '100%',
                height: 44,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '0 12px',
                fontSize: 14,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 8,
            }}>
              Graduation Year
            </label>
            <select
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              style={{
                width: '100%',
                height: 44,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '0 12px',
                fontSize: 14,
                color: gradYear ? '#0f172a' : '#94a3b8',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
                appearance: 'none',
              }}
            >
              <option value="" disabled>Select year</option>
              {GRAD_YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: 52,
            background: '#2774ae',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 12,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          style={{
            width: '100%',
            height: 48,
            background: 'transparent',
            color: '#64748b',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}
