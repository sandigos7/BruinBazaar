/**
 * BruinBazaar — My Listings
 * Matches Figma node 202:179
 * Route: /my-listings
 * Tabs: Active | Sold | ISO
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, limit, doc, updateDoc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import { deleteListing } from '../services/listingsService';
import { deleteISO } from '../services/isoService';

const TABS = ['Active', 'Sold', 'ISO'];

function SubHeader({ title, onBack }) {
  return (
    <div style={{ background: '#2774ae', padding: '44px 16px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', height: 44,
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', left: 0, background: 'none', border: 'none',
          cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 22, color: '#fff' }}>arrow_back</span>
        </button>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 18, color: '#fff',
        }}>{title}</span>
      </div>
    </div>
  );
}

function TabBar({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', borderBottom: '1px solid #e2e8f0',
      background: '#fff',
    }}>
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer',
            background: 'none',
            borderBottom: active === tab ? '2px solid #2774ae' : '2px solid transparent',
            fontFamily: 'Inter, sans-serif', fontWeight: active === tab ? 700 : 500,
            fontSize: 14, color: active === tab ? '#2774ae' : '#94a3b8',
            transition: 'all 0.15s',
          }}
        >{tab}</button>
      ))}
    </div>
  );
}

function ListingRow({ listing, isSold, isISO, navigate, user }) {
  const statusColor = isSold ? '#94a3b8' : '#16a34a';
  const statusLabel = isSold ? 'Sold' : isISO ? 'ISO' : listing.status === 'pending' ? 'Pending' : 'Active';
  const statusBg = isSold ? '#f1f5f9' : isISO ? '#eff6ff' : statusLabel === 'Pending' ? '#fff7ed' : '#f0fdf4';

  return (
    <div style={{
      background: '#fff', borderRadius: 16, margin: '0 16px 12px',
      padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', gap: 12,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{
          display: 'inline-block', alignSelf: 'flex-start',
          background: statusBg, color: statusColor,
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 11, padding: '2px 8px', borderRadius: 4,
        }}>{statusLabel}</span>

        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 16, color: '#0f172a',
        }}>{listing.title}</span>

        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8',
        }}>
          {listing.price != null ? `$${listing.price}` : ''}
          {listing.condition ? ` · ${listing.condition}` : ''}
        </span>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {!isSold && !isISO && (
            <button onClick={() => navigate(`/listings/${listing.id}`)} style={{
              padding: '6px 14px', borderRadius: 8,
              background: '#2774ae', border: 'none', cursor: 'pointer',
            }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fff' }}>View</span>
            </button>
          )}
          {!isSold && !isISO && (
            <button onClick={async () => {
              if (!window.confirm('Mark this listing as sold?')) return;
              await updateDoc(doc(db, 'listings', listing.id), { status: 'sold', sold: true });
              window.location.reload();
            }} style={{
              padding: '6px 14px', borderRadius: 8,
              background: '#16a34a', border: 'none', cursor: 'pointer',
            }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#fff' }}>Mark Sold</span>
            </button>
          )}
          <button onClick={async () => {
            if (!window.confirm(`Delete this ${isISO ? 'ISO post' : 'listing'}?`)) return;
            if (isISO) {
              await deleteISO(listing.id, user.uid, listing.imageUrls);
            } else {
              await deleteListing(listing.id, user.uid, listing.imageUrls);
            }
            window.location.reload();
          }} style={{
            padding: '6px 14px', borderRadius: 8,
            background: '#fee2e2', border: 'none', cursor: 'pointer',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#ef4444' }}>Delete</span>
          </button>
        </div>
      </div>

      <div style={{
        width: 110, height: 110, borderRadius: 12, overflow: 'hidden',
        background: '#f1f5f9', flexShrink: 0,
      }}>
        {(listing.imageUrl || listing.imageUrls?.[0]) ? (
          <img
            src={listing.imageUrl || listing.imageUrls?.[0]}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>image</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyTab({ tab }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 32px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>
        {tab === 'ISO' ? 'search' : tab === 'Sold' ? 'check_circle_outline' : 'inventory_2'}
      </span>
      <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>
        No {tab.toLowerCase()} {tab === 'ISO' ? 'posts' : 'listings'}
      </p>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
        {tab === 'Active' ? 'Create a listing to get started.' :
         tab === 'Sold' ? 'Items you sell will appear here.' :
         'Your ISO posts will appear here.'}
      </p>
    </div>
  );
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState('Active');
  const [listings, setListings] = useState([]);
  const [isos, setIsos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const lq = query(
          collection(db, 'listings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const lSnap = await getDocs(lq);
        setListings(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const iq = query(
          collection(db, 'isos'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const iSnap = await getDocs(iq);
        setIsos(iSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('MyListings fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const activeListings = listings.filter(l => l.status === 'active' && !l.sold);
  const soldListings = listings.filter(l => l.sold || l.status === 'sold');

  const currentItems = activeTab === 'Active' ? activeListings
    : activeTab === 'Sold' ? soldListings
    : isos;

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      fontFamily: 'Inter, sans-serif', background: '#f8fafc',
      paddingBottom: 97,
    }}>
      <SubHeader title="My Listings" onBack={() => navigate('/profile')} />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <div style={{ paddingTop: 16 }}>
        {loading ? (
          <div style={{ padding: '0 16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: '#f1f5f9', borderRadius: 16, height: 130,
                marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <EmptyTab tab={activeTab} />
        ) : (
          currentItems.map(item => (
            <ListingRow
              key={item.id}
              listing={item}
              isSold={activeTab === 'Sold'}
              isISO={activeTab === 'ISO'}
              navigate={navigate}
              user={user}
            />
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
      `}</style>
      <BottomNav />
    </div>
  );
}