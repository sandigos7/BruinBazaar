import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';


function MenuRow({ icon, iconBg, label, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', background: '#fff', border: 'none', borderRadius: 16,
      padding: 16, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 20, color: '#475569' }}>{icon}</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {badge !== undefined && (
          <div style={{
            background: '#f1f5f9', borderRadius: 12, padding: '2px 8px',
            fontSize: 12, fontWeight: 700, color: '#475569',
          }}>{badge}</div>
        )}
        <span className="material-icons" style={{ fontSize: 14, color: '#94a3b8' }}>chevron_right</span>
      </div>
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  // Parse user info from email: danielharris@ucla.edu → Daniel Harris
  const email = user?.email || '';
  const displayName = user?.displayName || email.split('@')[0].replace(/\./g, ' ')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const q = query(
          collection(db, 'listings'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        setActiveListingsCount(snap.size);
      } catch (err) {
        console.error('Error fetching listing count:', err);
      }
    };
    fetchCount();
  }, [user]);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  };

  return (
    <div style={{
      background: '#f8fafc', minHeight: '100vh',
      fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto',
      paddingBottom: 120,
    }}>
      {/* Top bar */}
      <div style={{ background: '#2774ae', padding: '44px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 40, color: '#fff', fontFamily: "'Jomhuria', serif", lineHeight: 1 }}>
            BruinBazaar
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            {['search', 'shopping_cart', 'notifications'].map(icon => (
              <span key={icon} className="material-icons"
                style={{ fontSize: 24, color: '#fff', cursor: 'pointer' }}>{icon}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div style={{
        background: '#fff', margin: '0 0 16px',
        padding: '0 0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Banner + Avatar */}
        <div style={{ position: 'relative', height: 110 }}>
          {/* Banner */}
          <div style={{
            height: 110, background: 'linear-gradient(135deg, #1a5f96 0%, #2774ae 50%, #ffd100 100%)',
            borderRadius: '0 0 0 0',
          }} />
          {/* Avatar */}
          <div style={{
            position: 'absolute', left: '50%', bottom: -40,
            transform: 'translateX(-50%)',
            width: 80, height: 80, borderRadius: '50%',
            border: '4px solid #fff',
            background: '#2774ae',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif',
            overflow: 'hidden',
          }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : initials}
            {/* Edit photo button */}
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 24, height: 24, borderRadius: '50%',
              background: '#2774ae', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <span className="material-icons" style={{ fontSize: 12, color: '#fff' }}>edit</span>
            </button>
          </div>
        </div>

        {/* Name + info */}
        <div style={{ marginTop: 48, textAlign: 'center', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>{displayName}</h2>
            <span className="material-icons" style={{ fontSize: 16, color: '#2774ae' }}>verified</span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0', letterSpacing: '0.3px' }}>{email}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Civil & Environmental Engineering</span>
            <div style={{
              background: '#f1f5f9', borderRadius: 9999, padding: '2px 10px',
              fontSize: 11, fontWeight: 700, color: '#475569',
            }}>2028</div>
          </div>
        </div>
      </div>

      {/* TrueBruin Review */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(255,209,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-icons" style={{ fontSize: 24, color: '#ffd100' }}>emoji_events</span>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.7px', textTransform: 'uppercase', margin: 0 }}>
                TrueBruin Review
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>4.9</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="material-icons" style={{ fontSize: 12, color: '#ffd100' }}>star</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{
            background: 'rgba(39,116,174,0.05)', borderRadius: 9999,
            padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#2774ae',
          }}>VERIFIED</div>
        </div>
      </div>

      {/* Account Activity */}
      <div style={{ padding: '8px 16px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 8 }}>
          Account Activity
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MenuRow
            icon="inventory_2"
            iconBg="#eff6ff"
            label="My Active Listings"
            badge={activeListingsCount}
            onClick={() => navigate('/my-listings')}
          />
          <MenuRow
            icon="favorite"
            iconBg="#fef2f2"
            label="Saved Items"
            onClick={() => navigate('/saved')}
          />
          <MenuRow
            icon="receipt_long"
            iconBg="#f0fdf4"
            label="Purchase History"
            onClick={() => navigate('/purchases')}
          />
          <MenuRow
            icon="credit_card"
            iconBg="#faf5ff"
            label="Payment Methods"
            onClick={() => navigate('/payments')}
          />
        </div>
      </div>

      {/* Support */}
      <div style={{ padding: '16px 16px 8px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 8 }}>
          Support
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <MenuRow
            icon="help_outline"
            iconBg="#f8fafc"
            label="Help Center"
            onClick={() => navigate('/help')}
          />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', background: '#fef2f2', border: 'none', borderRadius: 16,
              padding: 16, cursor: 'pointer',
              fontSize: 16, fontWeight: 700, color: '#dc2626',
              fontFamily: 'Inter, sans-serif',
              opacity: loggingOut ? 0.6 : 1,
            }}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}