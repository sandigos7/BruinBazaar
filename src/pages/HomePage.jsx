import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import BottomNav from '../components/BottomNav';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

const CATEGORIES = ['All', 'Textbooks', 'Furniture', 'Electronics', 'Clothing', 'Tickets'];


function ListingCard({ listing, onClick }) {
  const [saved, setSaved] = useState(false);
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 16, border: '0.8px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
      cursor: 'pointer', width: '100%',
    }}>
      <div style={{ position: 'relative', aspectRatio: '1/1', background: '#f1f5f9' }}>
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 40, color: '#cbd5e1' }}>image</span>
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: '#fff', borderRadius: '50%', border: 'none',
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}>
          <span className="material-icons" style={{ fontSize: 16, color: saved ? '#ef4444' : '#94a3b8' }}>
            {saved ? 'favorite' : 'favorite_border'}
          </span>
        </button>
        {listing.isNew && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: '#2774ae', borderRadius: 12,
            padding: '2px 8px',
            fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif',
          }}>New</div>
        )}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#0f172a',
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '65%',
          }}>{listing.title}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2774ae', fontFamily: 'Inter, sans-serif' }}>
            ${listing.price}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span className="material-icons" style={{ fontSize: 13, color: '#94a3b8' }}>location_on</span>
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
            {listing.location || 'On-Campus'}
          </span>
        </div>
        <div style={{
          borderTop: '0.8px solid #f8fafc', paddingTop: 6,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {listing.verified && (
            <>
              <span className="material-icons" style={{ fontSize: 11, color: '#ffd100' }}>verified_user</span>
              <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>VERIFIED</span>
            </>
          )}
          {listing.bruinLift && (
            <>
              <span className="material-icons" style={{ fontSize: 11, color: '#ffd100' }}>local_shipping</span>
              <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>BRUIN LIFT</span>
            </>
          )}
          {!listing.verified && !listing.bruinLift && listing.createdAt && (
            <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
              {listing.createdAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    const fetchListings = async () => {
      try {
        let q;
        if (activeCategory === 'All') {
          q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(20));
        } else {
          q = query(
            collection(db, 'listings'),
            where('category', '==', activeCategory),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
        }
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          verified: true, // all users are verified via @ucla.edu
          createdAt: doc.data().createdAt?.toDate
            ? formatTimeAgo(doc.data().createdAt.toDate())
            : null,
        }));
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [activeCategory]);

  const filteredListings = listings.filter(l =>
    !searchQuery || l.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayName = user?.displayName?.split(' ')[0] || 'Bruin';

  return (
    <div style={{
      background: '#f8fafc', minHeight: '100vh',
      fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ background: '#2774ae', padding: '44px 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{
            fontSize: 40, color: '#fff', fontFamily: "'Jomhuria', serif",
            lineHeight: 1,
          }}>BruinBazaar</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {['search', 'shopping_cart', 'notifications'].map(icon => (
              <button key={icon} onClick={() => icon === 'search' && navigate('/search')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', display: 'flex',
              }}>
                <span className="material-icons" style={{ fontSize: 24 }}>{icon}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <span className="material-icons" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: '#94a3b8',
          }}>search</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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

      {/* Category pills */}
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
              flexShrink: 0, height: 33, borderRadius: 9999,
              padding: '0 16px', fontSize: 12, fontWeight: activeCategory === cat ? 700 : 500,
              cursor: 'pointer', border: activeCategory === cat ? 'none' : '0.8px solid #e2e8f0',
              background: activeCategory === cat ? '#ffd100' : '#fff',
              color: activeCategory === cat ? '#2774ae' : '#0f172a',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Bulletin Board header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons" style={{ fontSize: 22, color: '#2774ae' }}>campaign</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Bulletin Board</span>
        </div>
        <button onClick={() => navigate('/bulletin')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#2774ae', fontFamily: 'Inter, sans-serif',
        }}>View All</button>
      </div>

      {/* My Tacks card */}
      <div style={{ padding: '0 16px 16px', overflowX: 'auto' }}>
        <div style={{
          background: '#eff6ff', borderRadius: 16, border: '0.8px solid #e2e8f0',
          padding: 16, minWidth: 280,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>My Tacks</span>
            <button onClick={() => navigate('/bulletin')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 10, color: '#2774ae', fontFamily: 'Inter, sans-serif',
              textDecoration: 'underline',
            }}>Edit</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'LOOKING FOR', color: '#2563eb', items: ['LS 7C Textbook', 'Vintage Nikon F3', 'Coffee Table'] },
              { label: 'SELLING', color: '#d97706', items: ['Vintage Jacket', 'Coffee Maker', 'Retro Sneakers'] },
            ].map(col => (
              <div key={col.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: col.color, letterSpacing: '0.5px' }}>{col.label}</span>
                </div>
                {col.items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>•</span>
                    <span style={{ fontSize: 12, color: '#334155', fontFamily: 'Inter, sans-serif' }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.8px solid #e2e8f0', marginTop: 10, paddingTop: 8, textAlign: 'center' }}>
            <button onClick={() => navigate('/bulletin')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 10, color: '#94a3b8', fontFamily: 'Inter, sans-serif',
              textDecoration: 'underline',
            }}>Tap to open corkboard view</button>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Recommended for You</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
            <span className="material-icons" style={{ fontSize: 16 }}>tune</span>
            <span style={{ fontSize: 12 }}>Filter</span>
          </div>
        </div>

        {loading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: '#f1f5f9', borderRadius: 16,
                aspectRatio: '1/1.4', animation: 'pulse 1.5s infinite',
              }} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>search_off</span>
            <span style={{ fontSize: 14 }}>No listings yet. Be the first to post!</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {filteredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listing/${listing.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function formatTimeAgo(date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}