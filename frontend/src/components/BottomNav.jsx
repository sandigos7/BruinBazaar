/**
 * BruinBazaar — BottomNav
 * The center + button opens a choice sheet: Post Listing vs Post ISO.
 * Sheet slides up from bottom, dismisses on backdrop tap or close button.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'home',        label: 'Home',    path: '/' },
  { icon: 'campaign',    label: 'Bulletin', path: '/bulletin' },
  { icon: null,          label: 'Post',    path: null, isCenter: true },
  { icon: 'chat_bubble', label: 'Chats',   path: '/messages' },
  { icon: 'person',      label: 'Profile', path: '/profile' },
];

// ─── Post Choice Sheet ────────────────────────────────────────────────────────

function PostSheet({ open, onClose, onSelect }) {
  // Prevent body scroll while sheet is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: `translateX(-50%) translateY(${open ? '0' : '100%'})`,
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          zIndex: 201,
          transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 9999,
            background: '#E2E8F0',
            margin: '12px auto 0',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 4px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 18,
              color: '#0F172A',
            }}
          >
            What are you posting?
          </p>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F1F5F9',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-icons" style={{ fontSize: 18, color: '#64748B' }}>close</span>
          </button>
        </div>

        {/* Options */}
        <div style={{ padding: '16px 20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Post a Listing */}
          <button
            onClick={() => onSelect('/create-listing')}
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              padding: '18px 20px',
              borderRadius: 18,
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#DBEAFE')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#EFF6FF')}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: '#2774AE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-icons" style={{ fontSize: 26, color: '#fff' }}>sell</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#0F172A',
                  marginBottom: 3,
                }}
              >
                Post a Listing
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: '#64748B',
                  lineHeight: 1.4,
                }}
              >
                Sell something you own — furniture, clothes, electronics, and more.
              </p>
            </div>
            <span className="material-icons" style={{ fontSize: 20, color: '#94A3B8', flexShrink: 0 }}>
              chevron_right
            </span>
          </button>

          {/* Post an ISO */}
          <button
            onClick={() => onSelect('/create-iso')}
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              padding: '18px 20px',
              borderRadius: 18,
              background: '#FFF7ED',
              border: '1.5px solid #FED7AA',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFEDD5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFF7ED')}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: '#F97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-icons" style={{ fontSize: 26, color: '#fff' }}>search</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#0F172A',
                  }}
                >
                  Post an ISO
                </p>
                <span
                  style={{
                    background: '#FED7AA',
                    color: '#C2410C',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 9999,
                    letterSpacing: '0.3px',
                  }}
                >
                  IN SEARCH OF
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: '#64748B',
                  lineHeight: 1.4,
                }}
              >
                Looking for something? Post it and let sellers come to you.
              </p>
            </div>
            <span className="material-icons" style={{ fontSize: 20, color: '#94A3B8', flexShrink: 0 }}>
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSelect = (path) => {
    setSheetOpen(false);
    // Small delay so the sheet close animation plays before navigation
    setTimeout(() => navigate(path), 180);
  };

  return (
    <>
      <PostSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={handleSelect}
      />

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderTop: '0.8px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px 28px',
          zIndex: 100,
          boxSizing: 'border-box',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = item.path && pathname === item.path;

          if (item.isCenter) {
            return (
              <button
                key="post"
                onClick={() => setSheetOpen(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: sheetOpen ? '#2774AE' : '#FFD100',
                    border: '4px solid #fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: -20,
                    transition: 'background 0.2s, transform 0.2s',
                    transform: sheetOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <span
                    className="material-icons"
                    style={{
                      fontSize: 28,
                      color: sheetOpen ? '#fff' : '#2774AE',
                      transition: 'color 0.2s',
                    }}
                  >
                    add
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    color: '#94a3b8',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                color: isActive ? '#2774ae' : '#94a3b8',
              }}
            >
              <span className="material-icons" style={{ fontSize: 24 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}