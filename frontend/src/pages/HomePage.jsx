/**
 * BruinBazaar — Home Page (Revamped)
 * Matches Figma node 14:49
 * Route: /
 *
 * Layout:
 *   1. Blue header with BruinBazaar logo + cart + notifications + search bar
 *   2. Category pills (horizontally scrollable)
 *   3. Bulletin Board header + "View All" link
 *   4. Corkboard "My Tacks" horizontally scrollable section
 *   5. "Recommended for You" 2-column listing grid from Firestore
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

// ─── Corkboard texture ───────────────────────────────────────────────────────
const CORK_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E")`;

const CATEGORIES = ['All', 'Textbooks', 'Furniture', 'Electronics', 'Clothing', 'Tickets'];

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 0, display: 'flex', alignItems: 'center',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeAgo(date) {
  if (!date) return '';
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Listing Card (matches Figma exactly) ────────────────────────────────────

function ListingCard({ listing, onClick }) {
  const [saved, setSaved] = useState(false);
  const isNew = listing._isNew;

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 16,
      border: '0.8px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      overflow: 'hidden', cursor: 'pointer',
      width: '100%',
    }}>
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
        {/* Favorite */}
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: '#fff', borderRadius: '50%', border: 'none',
            width: 30, height: 30, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 6,
          }}
        >
          <span className="material-icons" style={{
            fontSize: 18, color: saved ? '#ef4444' : '#475569',
          }}>{saved ? 'favorite' : 'favorite_border'}</span>
        </button>
        {/* New badge */}
        {isNew && (
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
        {/* Title + price */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
        }}>
          <span style={{
            color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', flex: 1, marginRight: 4,
          }}>{listing.title}</span>
          <span style={{ color: '#2774ae', flexShrink: 0 }}>${listing.price}</span>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-icons" style={{ fontSize: 14, color: '#94a3b8' }}>location_on</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b',
          }}>{listing.meetupSpots?.[0] || 'On-Campus'}</span>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '0.8px solid #f8fafc', paddingTop: 8,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {listing.bruinLift ? (
            <>
              <span className="material-icons" style={{ fontSize: 12, color: '#ffd100' }}>local_shipping</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94a3b8' }}>BRUIN LIFT</span>
            </>
          ) : listing._timeAgo && !listing.verified ? (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94a3b8' }}>{listing._timeAgo}</span>
          ) : (
            <>
              <span className="material-icons" style={{ fontSize: 12, color: '#ffd100' }}>verified_user</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94a3b8' }}>VERIFIED</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── My Tacks Card ───────────────────────────────────────────────────────────

function TacksCard({ title, lookingFor, selling, bgColor, onTap }) {
  return (
    <div
      onClick={onTap}
      style={{
        background: bgColor || '#eff6ff',
        backgroundImage: CORK_BG,
        border: '0.8px solid #94a3b8',
        borderRadius: 16, padding: 16,
        width: 314, flexShrink: 0,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#000' }}>
          {title}
        </span>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 10,
          color: '#2774ae', textDecoration: 'underline', cursor: 'pointer',
        }}>Edit</span>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Looking For */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 10, color: '#2563eb',
            }}>LOOKING FOR</span>
          </div>
          {lookingFor.map(item => (
            <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>•</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#334155' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Selling */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 10, color: '#d97706',
            }}>SELLING</span>
          </div>
          {selling.map(item => (
            <div key={item} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>•</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14, color: '#334155' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '0.8px solid #f8fafc', paddingTop: 8, textAlign: 'center' }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 10,
          color: '#94a3b8', textDecoration: 'underline',
        }}>Tap to open corkboard view</span>
      </div>
    </div>
  );
}

// ─── Main HomePage ───────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      let q;
      if (activeCategory === 'All') {
        q = query(
          collection(db, 'listings'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else {
        q = query(
          collection(db, 'listings'),
          where('status', '==', 'active'),
          where('category', '==', activeCategory),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }
      const snap = await getDocs(q);
      const now = Date.now();
      const data = snap.docs.map(doc => {
        const d = doc.data();
        const created = d.createdAt?.toDate?.();
        return {
          id: doc.id,
          ...d,
          verified: true,
          _isNew: created ? (now - created.getTime()) < 86400000 : false,
          _timeAgo: created ? formatTimeAgo(created) : null,
        };
      });
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      // Fallback: try without status filter (for existing data that may not have status)
      try {
        const fallback = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(fallback);
        const now = Date.now();
        setListings(snap.docs.map(doc => {
          const d = doc.data();
          const created = d.createdAt?.toDate?.();
          return {
            id: doc.id, ...d, verified: true,
            _isNew: created ? (now - created.getTime()) < 86400000 : false,
            _timeAgo: created ? formatTimeAgo(created) : null,
          };
        }).filter(l => !l.sold));
      } catch { /* empty state will show */ }
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(l =>
    !searchQuery || l.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      background: '#f8fafc', minHeight: '100vh',
      fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto',
      paddingBottom: 100,
    }}>
      {/* ── Header ── */}
      <div style={{ background: '#2774ae', padding: '44px 16px 16px' }}>
        {/* Brand row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <span style={{
            fontFamily: "'Jomhuria', serif", fontSize: 64, color: '#fff', lineHeight: 1,
          }}>BruinBazaar</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={iconBtn} onClick={() => navigate('/saved')}>
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
        <div style={{ position: 'relative' }}>
          <span className="material-icons" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 20, color: '#94a3b8',
          }}>search</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => navigate('/search')}
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

      {/* ── Category pills ── */}
      <div style={{
        padding: '12px 16px 8px',
        overflowX: 'auto', display: 'flex', gap: 8,
        scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0, height: 34, borderRadius: 9999,
              padding: '0 16px', fontSize: 12,
              fontWeight: activeCategory === cat ? 700 : 500,
              cursor: 'pointer',
              border: activeCategory === cat ? 'none' : '0.8px solid #e2e8f0',
              background: activeCategory === cat ? '#ffd100' : '#fff',
              color: activeCategory === cat ? '#2774ae' : '#0f172a',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* ── Bulletin Board header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons" style={{ fontSize: 24, color: '#2774ae' }}>campaign</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Bulletin Board</span>
        </div>
        <button onClick={() => navigate('/bulletin')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#2774ae', fontFamily: 'Inter, sans-serif',
        }}>View All</button>
      </div>

      {/* ── My Tacks (horizontal scroll on corkboard) ── */}
      <div style={{
        background: '#c4824a',
        backgroundImage: CORK_BG,
        borderTop: '10px solid #94a3b8',
        borderBottom: '10px solid #94a3b8',
        padding: '16px 16px',
        overflowX: 'auto',
        display: 'flex',
        gap: 10,
        scrollbarWidth: 'none',
      }}>
        <TacksCard
          title="My Tacks"
          lookingFor={['LS 7C Textbook', 'Vintage Nikon F3', 'Coffee Table']}
          selling={['Vintage Jacket', 'Coffee Maker', 'Retro Sneakers']}
          bgColor="#eff6ff"
          onTap={() => navigate('/bulletin')}
        />
        {/* Second card shows other users' tacks (friend tacks, community) */}
        <TacksCard
          title="Community Tacks"
          lookingFor={['Desk Lamp', 'Mini Fridge', 'TI-84 Calculator']}
          selling={['UCLA Hoodie', 'OChem Textbook', 'Bluetooth Speaker']}
          bgColor="#fffbeb"
          onTap={() => navigate('/bulletin')}
        />
      </div>

      {/* ── Recommended for You ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Recommended for You</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: 18 }}>tune</span>
            <span style={{ fontSize: 12 }}>Filter</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: '#f1f5f9', borderRadius: 16,
                aspectRatio: '1/1.5', animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>search_off</span>
            <span style={{ fontSize: 14 }}>No listings yet. Be the first to post!</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 12px' }}>
            {filteredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
      `}</style>

      <BottomNav />
    </div>
  );
}