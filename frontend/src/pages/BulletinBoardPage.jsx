/**
 * BruinBazaar — Revamped Bulletin Board
 * Matches Figma nodes 228:625 (Buying) and 225:307 (Selling)
 *
 * Two tabs on a corkboard-textured background:
 *   • LOOKING FOR — sticky-note ISO cards with push pins
 *   • SELLING — standard listing cards with photos
 *
 * Data: Fetches from Firestore `isos` and `listings` collections.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

// ─── Corkboard background (inline data-uri for the subtle dot texture) ───────
const CORK_BG = `url("https://firebasestorage.googleapis.com/v0/b/bruinbazaar-4.firebasestorage.app/o/Misc%20Assets%2FAdobeStock_124824681.jpeg?alt=media&token=a39e679c-1e00-4393-ac17-c84b0878b367")`;

// ─── Card colors for ISO notes (rotate through) ─────────────────────────────
const ISO_COLORS = ['#fef9c3', '#ffdefb', '#bae1f9', '#feffff'];

// ─── Push pin SVGs (simple colored circles with highlight, matching Figma) ───
const PIN_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#f97316'];

function PushPin({ color = '#dc2626' }) {
  return (
    <svg width="24" height="28" viewBox="0 0 24 28" fill="none" style={{ display: 'block', margin: '0 auto' }}>
      <circle cx="12" cy="10" r="8" fill={color} />
      <circle cx="10" cy="8" r="3" fill="rgba(255,255,255,0.4)" />
      <rect x="11" y="18" width="2" height="10" rx="1" fill="#94a3b8" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({ searchQuery, onSearchChange, onSearchSubmit }) {
  return (
    <div style={{ background: '#2774ae', padding: '44px 16px 12px' }}>
      {/* Brand row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: "'Jomhuria', serif", fontSize: 64, color: '#fff', lineHeight: 1,
        }}>BruinBazaar</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={iconBtn}>
            <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>shopping_cart</span>
          </button>
          <button style={{ ...iconBtn, position: 'relative' }}>
            <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>notifications</span>
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 8, height: 8, borderRadius: '50%', background: '#FFD100',
            }} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span className="material-icons" style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 20, color: '#94a3b8',
        }}>search</span>
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearchSubmit?.()}
          placeholder="Search items, textbooks, housing..."
          style={{
            width: '100%', height: 40, borderRadius: 12, border: 'none',
            paddingLeft: 40, paddingRight: 16,
            fontSize: 14, color: '#0f172a', background: '#fff',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 0, display: 'flex', alignItems: 'center',
};

// ─── Tab Toggle ──────────────────────────────────────────────────────────────

function TabToggle({ activeTab, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: 12, padding: 4,
    }}>
      {[
        { key: 'looking', label: 'LOOKING FOR' },
        { key: 'selling', label: 'SELLING' },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            flex: 1, height: 28, border: 'none', borderRadius: 8,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
            background: activeTab === tab.key ? '#fff' : 'transparent',
            color: activeTab === tab.key ? '#2774ae' : 'rgba(255,255,255,0.5)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── ISO Card (Looking For tab) ──────────────────────────────────────────────

function ISOCard({ post, index, onClick }) {
  const bgColor = ISO_COLORS[index % ISO_COLORS.length];
  const pinColor = PIN_COLORS[index % PIN_COLORS.length];
  const initials = getInitials(post.sellerName);

  return (
    <div
      onClick={onClick}
      style={{
        background: bgColor,
        border: '0.8px solid #f1f5f9',
        boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 11,
        cursor: 'pointer',
      }}
    >
      {/* Push pin */}
      <PushPin color={pinColor} />

      {/* Content */}
      <div style={{ padding: '0 12px', width: '100%', boxSizing: 'border-box' }}>
        {/* Title */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 14, color: '#0f172a', lineHeight: 1.3,
          margin: '0 0 8px', wordBreak: 'break-word',
        }}>
          ISO: {post.title}
        </p>

        {/* Details */}
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b',
          lineHeight: 1.5, marginBottom: 8,
        }}>
          {post.description ? (
            <p style={{ margin: 0 }}>{post.description.slice(0, 80)}{post.description.length > 80 ? '...' : ''}</p>
          ) : (
            <>
              {post.category && <p style={{ margin: 0 }}>Category: {post.category}</p>}
              {post.condition && <p style={{ margin: 0 }}>Condition: {post.condition}</p>}
              {post.price != null && <p style={{ margin: 0 }}>Budget: up to ${post.price}</p>}
            </>
          )}
        </div>

        {/* Footer: avatar + name + reply */}
        <div style={{
          display: 'flex', gap: 4, alignItems: 'center',
        }}>
          <div style={{
            width: 17, height: 17, borderRadius: '50%',
            background: '#2774ae', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 700,
              fontSize: 7, color: '#fff',
            }}>{initials}</span>
          </div>
          <span style={{
            flex: 1, fontFamily: 'Inter, sans-serif',
            fontSize: 11, color: '#64748b',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {post.sellerName ? `${post.sellerName.split(' ')[0]} ${(post.sellerName.split(' ')[1] || '')[0] || ''}.`.trim() : 'Bruin'}
          </span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 11, color: '#2774ae',
            textDecoration: 'underline', cursor: 'pointer',
          }}>
            Reply
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Selling Card (matches Figma 225:307) ────────────────────────────────────

function SellingCard({ listing, onClick }) {
  const [saved, setSaved] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 16,
        border: '0.8px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f1f5f9' }}>
        {(listing.imageUrl || listing.imageUrls?.[0]) ? (
          <img
            src={listing.imageUrl || listing.imageUrls?.[0]}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons" style={{ fontSize: 40, color: '#cbd5e1' }}>image</span>
          </div>
        )}
        {/* Favorite button */}
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: '#fff', borderRadius: '50%', border: 'none',
            width: 30, height: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            padding: 6,
          }}
        >
          <span className="material-icons" style={{
            fontSize: 18, color: saved ? '#ef4444' : '#475569',
          }}>
            {saved ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        {/* "New" badge — show if created within last 24h */}
        {listing._isNew && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: '#2774ae', borderRadius: 12,
            padding: '4px 8px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>New</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Title + price row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
        }}>
          <span style={{
            color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', flex: 1, marginRight: 4,
          }}>{listing.title}</span>
          <span style={{ color: '#2774ae', flexShrink: 0 }}>
            ${listing.price}
          </span>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-icons" style={{ fontSize: 14, color: '#94a3b8' }}>location_on</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b',
          }}>
            {listing.meetupSpots?.[0] || listing.location?.address || 'On-Campus'}
          </span>
        </div>

        {/* Footer badges */}
        <div style={{
          borderTop: '0.8px solid #f8fafc', paddingTop: 8,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {listing.verified !== false && (
            <>
              <span className="material-icons" style={{ fontSize: 12, color: '#ffd100' }}>verified_user</span>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94a3b8',
              }}>VERIFIED</span>
            </>
          )}
          {listing.bruinLift && (
            <>
              <span className="material-icons" style={{ fontSize: 12, color: '#ffd100' }}>local_shipping</span>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94a3b8',
              }}>BRUIN LIFT</span>
            </>
          )}
          {!listing.bruinLift && listing.verified === false && listing._timeAgo && (
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94a3b8',
            }}>{listing._timeAgo}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ tab, onPost }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 32px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <span className="material-icons" style={{
        fontSize: 48, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 12,
      }}>
        {tab === 'looking' ? 'search' : 'storefront'}
      </span>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>
        {tab === 'looking' ? 'No ISO posts yet' : 'No listings yet'}
      </p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
        {tab === 'looking'
          ? 'Be the first to post what you\'re looking for'
          : 'Be the first to list something for sale'}
      </p>
      <button
        onClick={onPost}
        style={{
          background: '#fff', color: '#2774ae', border: 'none',
          borderRadius: 10, padding: '10px 20px',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {tab === 'looking' ? 'Post ISO' : 'Create Listing'}
      </button>
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingGrid() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 14, padding: 24,
    }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.3)', borderRadius: 4,
          height: 170,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

// ─── Main BulletinBoardPage ──────────────────────────────────────────────────

export default function BulletinBoardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('looking');
  const [isoPosts, setIsoPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ISO posts from `isos` collection
      const isoQuery = query(
        collection(db, 'isos'),
        where('found', '==', false),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const isoSnap = await getDocs(isoQuery);
      const isoData = isoSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIsoPosts(isoData);

      // Fetch listings from `listings` collection
      const listingQuery = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const listingSnap = await getDocs(listingQuery);
      const now = Date.now();
      const listingData = listingSnap.docs.map(doc => {
        const d = doc.data();
        const created = d.createdAt?.toDate?.();
        return {
          id: doc.id,
          ...d,
          _isNew: created ? (now - created.getTime()) < 86400000 : false,
          _timeAgo: created ? timeAgo(created) : '',
        };
      });
      setListings(listingData);
    } catch (err) {
      console.error('BulletinBoard fetch error:', err);
      // If isos collection doesn't exist yet, also try listings with type=iso as fallback
      try {
        const fallbackIso = query(
          collection(db, 'listings'),
          where('type', '==', 'iso'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const fallbackSnap = await getDocs(fallbackIso);
        setIsoPosts(fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        // Silently fail — empty state will show
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter by search query (client-side for now)
  const filteredISOs = isoPosts.filter(p =>
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredListings = listings.filter(l =>
    !searchQuery || l.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
  <div style={{
    minHeight: '100vh',
    maxWidth: 480,
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif',
    background: '#f8fafc',
    paddingBottom: 97,
    position: 'relative',
  }}>
    {/* Entire header — sticky */}
    <div style={{
      background: '#2774ae',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand row */}
      <div style={{
        padding: '44px 16px 12px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{
            fontFamily: "'Jomhuria', serif", fontSize: 64, color: '#fff', lineHeight: 1,
          }}>BruinBazaar</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={iconBtn}>
              <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>shopping_cart</span>
            </button>
            <button style={{ ...iconBtn, position: 'relative' }}>
              <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>notifications</span>
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 8, height: 8, borderRadius: '50%', background: '#FFD100',
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{
        padding: '0 16px 12px',
      }}>
        <div style={{ position: 'relative' }}>
          <span className="material-icons" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 20, color: '#94a3b8',
          }}>search</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search items, textbooks, housing..."
            style={{
              width: '100%', height: 40, borderRadius: 12, border: 'none',
              paddingLeft: 40, paddingRight: 16,
              fontSize: 14, color: '#0f172a', background: '#fff',
              fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{
        padding: '0 16px 16px',
      }}>
        <TabToggle activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>

    {/* Corkboard content area */}
    <div style={{
      background: '#c4824a',
      backgroundImage: CORK_BG,
      backgroundSize: '1367px 2048px',
      minHeight: 'calc(100vh - 260px)',
      padding: 24,
    }}>
      {loading ? (
        <LoadingGrid />
      ) : activeTab === 'looking' ? (
        /* ── LOOKING FOR tab ── */
        filteredISOs.length === 0 ? (
          <EmptyState tab="looking" onPost={() => navigate('/create-iso')} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px 17px',
          }}>
            {filteredISOs.map((post, i) => (
              <ISOCard
                key={post.id}
                post={post}
                index={i}
                onClick={() => {
                  // Navigate to ISO detail or open reply
                  // For now, we could navigate to a messages flow
                }}
              />
            ))}
          </div>
        )
      ) : (
        /* ── SELLING tab ── */
        filteredListings.length === 0 ? (
          <EmptyState tab="selling" onPost={() => navigate('/create-listing')} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px 17px',
          }}>
            {filteredListings.map(listing => (
              <SellingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        )
      )}
    </div>

    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.7; }
      }
    `}</style>

    <BottomNav />
  </div>
);
}