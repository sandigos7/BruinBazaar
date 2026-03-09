/**
 * BruinBazaar — My Cart (Saved/Wishlisted Items)
 * Matches Figma node 202:413
 * Route: /saved (mapped from ProfilePage "Saved Items")
 *
 * Note: BruinBazaar doesn't have traditional cart/checkout (PRD: no in-app payments).
 * This functions as a "saved items" / wishlist view with "Message Seller" CTAs.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

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
        <button style={{
          position: 'absolute', right: 0, background: 'none', border: 'none',
          cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center',
        }}>
          <span className="material-icons" style={{ fontSize: 22, color: '#fff' }}>search</span>
        </button>
      </div>
    </div>
  );
}

function CartItem({ item, onMessage, onRemove }) {
  const isSoldOut = item.sold;

  return (
    <div style={{
      background: '#fff', margin: '0 0 1px',
      padding: 0, overflow: 'hidden',
    }}>
      {/* Image */}
      <div style={{
        width: '100%', height: 200, background: '#f1f5f9',
        position: 'relative',
      }}>
        {item.image ? (
          <img src={item.image} alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1' }}>image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 16px 16px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 4,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 16, color: '#0f172a', flex: 1,
          }}>{item.title}</span>
          <button onClick={() => onRemove?.(item)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, display: 'flex',
          }}>
            <span className="material-icons" style={{
              fontSize: 20, color: '#2774ae',
            }}>favorite</span>
          </button>
        </div>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 18, color: '#e85d26', margin: '0 0 4px',
        }}>${item.price.toFixed(2)}</p>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8',
          margin: '0 0 4px',
        }}>{item.details}</p>

        {item.eyeing && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8,
          }}>
            <span className="material-icons" style={{ fontSize: 14, color: '#16a34a' }}>visibility</span>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#16a34a',
            }}>{item.eyeing} people eyeing</span>
          </div>
        )}

        {isSoldOut ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 700,
              fontSize: 12, color: '#ef4444', textTransform: 'uppercase',
            }}>SOLD OUT</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{
                padding: '8px 16px', borderRadius: 8,
                background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 13, color: '#2774ae',
              }}>Find Similar</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => onMessage?.(item)} style={{
              padding: '8px 20px', borderRadius: 8,
              background: '#2774ae', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 700,
              fontSize: 13, color: '#fff',
            }}>Message Seller</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder — in production, pull from a `savedListings` subcollection or local state
const MOCK_SAVED = [
  { id: '1', title: 'UCLA Blue Hoodie', price: 25, details: 'Size: M \u00B7 Like New', eyeing: 6, sold: false, image: null },
  { id: '2', title: 'Organic Chemistry Vol. 2', price: 45, details: '7th Edition \u00B7 Hardcover', eyeing: 4, sold: false, image: null },
  { id: '3', title: 'Vintage Casio Watch', price: 15, details: 'Silver \u00B7 Great Condition', eyeing: null, sold: true, image: null },
];

export default function CartPage() {
  const navigate = useNavigate();
  const [items] = useState(MOCK_SAVED);

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      fontFamily: 'Inter, sans-serif', background: '#f8fafc',
      paddingBottom: 97,
    }}>
      <SubHeader title="My Cart" onBack={() => navigate('/profile')} />

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 32px' }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>favorite_border</span>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>No saved items</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Items you save will appear here.
          </p>
        </div>
      ) : (
        items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onMessage={() => {/* navigate to chat */}}
            onRemove={() => {/* remove from saved */}}
          />
        ))
      )}
      <BottomNav />
    </div>
  );
}
