import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// Tag color based on type
const TAG_STYLES = {
  'ISO / Wanted':    { bg: '#e8f0f7', color: '#2774ae' },
  'WANTED':         { bg: '#fffde7', color: '#b8860b' },
  'TICKET WANTED':  { bg: '#fce4ec', color: '#c62828' },
  'default':        { bg: '#f3e5f5', color: '#6a1b9a' },
};

// ─── ISO Card (Looking For tab) ───────────────────────────────────────────────

function ISOCard({ post }) {
  const navigate = useNavigate();
  const tag = post.isoTag || 'ISO / Wanted';
  const tagStyle = TAG_STYLES[tag] || TAG_STYLES.default;
  const initials = getInitials(post.sellerName);

  // Slight rotation for bulletin board feel
  const rotation = post._rotation || 0;

  return (
    <div style={{
      background: post.cardColor || '#fff',
      borderRadius: 4,
      padding: '14px 16px',
      boxShadow: '2px 3px 8px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.1)',
      transform: `rotate(${rotation}deg)`,
      marginBottom: 16,
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Tape strip at top */}
      <div style={{
        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
        width: 48, height: 16, background: 'rgba(255,255,200,0.7)',
        borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.8px',
          textTransform: 'uppercase', color: tagStyle.color,
          background: tagStyle.bg, padding: '2px 8px', borderRadius: 4,
        }}>{tag}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(post.createdAt?.toDate?.())}</span>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: '#1e1e1e', margin: '0 0 6px', lineHeight: 1.4 }}>
        <span style={{ color: '#2774ae' }}>Looking for</span>: {post.title}
      </p>
      <p style={{ fontSize: 13, color: '#475569', margin: '0 0 12px', lineHeight: 1.5 }}>
        {post.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: post.avatarColor || '#2774ae',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>{initials}</div>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{post.sellerName}</span>
        </div>
        <button
          onClick={() => navigate(`/messages?userId=${post.userId}&listingId=${post.id}`)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, color: '#2774ae',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Reply
        </button>
      </div>
    </div>
  );
}

// ─── Selling Card ─────────────────────────────────────────────────────────────

function SellingCard({ listing }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      style={{
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '2px 3px 8px rgba(0,0,0,0.18)',
        marginBottom: 16,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {listing.imageUrl ? (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 200,
          background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1' }}>image</span>
        </div>
      )}
      <div style={{ padding: '10px 12px 14px' }}>
        <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.4 }}>
          <strong style={{ color: '#2774ae' }}>${listing.price}</strong> – {listing.title}
        </p>
        {listing.condition && (
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{listing.condition}</p>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onPost }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 32px', fontFamily: 'Inter, sans-serif' }}>
      <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>
        {tab === 'looking' ? 'search' : 'storefront'}
      </span>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>
        {tab === 'looking' ? 'No ISO posts yet' : 'No listings yet'}
      </p>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
        {tab === 'looking'
          ? 'Be the first to post what you\'re looking for'
          : 'Be the first to list something for sale'}
      </p>
      <button
        onClick={onPost}
        style={{
          background: '#2774ae', color: '#fff', border: 'none',
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

// ─── Main BulletinBoardPage ───────────────────────────────────────────────────

// Sample ISO colors for visual variety
const CARD_COLORS = ['#fffef0', '#fff9e6', '#f0f8ff', '#fff0f5', '#f0fff4'];
const AVATAR_COLORS = ['#2774ae', '#e53e3e', '#38a169', '#d69e2e', '#805ad5'];
const ISO_TAGS = ['ISO / Wanted', 'WANTED', 'TICKET WANTED'];

export default function BulletinBoardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('looking'); // 'looking' | 'selling'
  const [isoPosts, setIsoPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ISO posts (type === 'iso')
      const isoQuery = query(
        collection(db, 'listings'),
        where('type', '==', 'iso'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const isoSnap = await getDocs(isoQuery);
      const isoData = isoSnap.docs.map((doc, i) => ({
        id: doc.id,
        ...doc.data(),
        cardColor: CARD_COLORS[i % CARD_COLORS.length],
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        isoTag: ISO_TAGS[i % ISO_TAGS.length],
        _rotation: (i % 3 === 0 ? -0.5 : i % 3 === 1 ? 0.5 : 0),
      }));
      setIsoPosts(isoData);

      // Fetch regular listings (type !== 'iso' or no type field)
      const listingQuery = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const listingSnap = await getDocs(listingQuery);
      const listingData = listingSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(l => l.type !== 'iso');
      setListings(listingData);
    } catch (err) {
      console.error('Error fetching bulletin board data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = () => navigate('/create-listing');

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 480,
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif',
      background: '#c4824a', // corkboard base
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E")
      `,
      paddingBottom: 120,
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{ background: '#2774ae', padding: '44px 16px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <span style={{ fontFamily: "'Jomhuria', serif", fontSize: 40, color: '#fff', lineHeight: 1 }}>
            BruinBazaar
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['search', 'shopping_cart', 'notifications'].map(icon => (
              <span key={icon} className="material-icons" style={{ fontSize: 24, color: '#fff', cursor: 'pointer' }}>{icon}</span>
            ))}
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', margin: '12px 0 0',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 10, padding: 4,
        }}>
          {[
            { key: 'looking', label: 'LOOKING FOR' },
            { key: 'selling', label: 'SELLING' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, height: 36, border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700, letterSpacing: '0.5px',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? '#2774ae' : 'rgba(255,255,255,0.8)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Corkboard edge */}
        <div style={{ height: 8, background: '#b5722a', marginTop: 0 }} />
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : activeTab === 'looking' ? (
          isoPosts.length === 0
            ? <EmptyState tab="looking" onPost={handlePost} />
            : isoPosts.map(post => <ISOCard key={post.id} post={post} />)
        ) : (
          listings.length === 0
            ? <EmptyState tab="selling" onPost={handlePost} />
            : listings.map(listing => <SellingCard key={listing.id} listing={listing} />)
        )}
      </div>

      {/* Floating post button */}
      <button
        onClick={handlePost}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 'max(16px, calc(50vw - 240px + 16px))',
          width: 52, height: 52,
          borderRadius: '50%',
          background: '#2774ae',
          border: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 40,
        }}
      >
        <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>edit</span>
      </button>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <BottomNav />
    </div>
  );
}