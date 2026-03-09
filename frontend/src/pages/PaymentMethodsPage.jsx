/**
 * BruinBazaar — Payment Methods
 * Matches Figma node 202:527
 * Route: /payments
 *
 * Note: In-app payments are out of scope for MVP (PRD: Venmo/Zelle links only).
 * This is a forward-looking UI shell. Saved cards and digital wallets are
 * placeholder — no real payment integration yet.
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
          <span className="material-icons" style={{ fontSize: 22, color: '#fff' }}>security</span>
        </button>
      </div>
    </div>
  );
}

function CardRow({ brand, last4, expires, onRemove }) {
  const brandColors = {
    Visa: '#1a1f71',
    Mastercard: '#eb001b',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 16, background: '#fff', borderRadius: 12,
      border: '1px solid #e2e8f0',
    }}>
      {/* Brand icon placeholder */}
      <div style={{
        width: 48, height: 32, borderRadius: 6,
        background: '#f1f5f9', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 10, color: brandColors[brand] || '#475569',
        }}>{brand?.toUpperCase()}</span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 14, color: '#0f172a', margin: '0 0 2px',
        }}>{brand} ending in {last4}</p>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', margin: 0,
        }}>Expires {expires}</p>
      </div>

      <button onClick={onRemove} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', fontWeight: 600,
        fontSize: 13, color: '#e85d26', padding: 4,
      }}>Remove</button>
    </div>
  );
}

function WalletRow({ name, subtitle, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 16, background: '#fff', borderRadius: 12,
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        width: 48, height: 32, borderRadius: 6,
        background: '#f1f5f9', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 11, color: '#475569',
        }}>{icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 14, color: '#0f172a', margin: '0 0 2px',
        }}>{name}</p>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', margin: 0,
        }}>{subtitle}</p>
      </div>
      <span className="material-icons" style={{ fontSize: 18, color: '#94a3b8' }}>chevron_right</span>
    </div>
  );
}

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const [cards] = useState([
    { id: '1', brand: 'Visa', last4: '1234', expires: '12/26' },
    { id: '2', brand: 'Mastercard', last4: '5678', expires: '08/25' },
  ]);

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      fontFamily: 'Inter, sans-serif', background: '#f8fafc',
      paddingBottom: 97,
    }}>
      <SubHeader title="Payment Methods" onBack={() => navigate('/profile')} />

      <div style={{ padding: '24px 16px' }}>
        {/* Secure badge */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: '#2774ae', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <span className="material-icons" style={{ fontSize: 32, color: '#fff' }}>credit_card</span>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94a3b8', margin: 0,
          }}>BruinBazaar Secure Checkout</p>
        </div>

        {/* Saved Cards */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 18, color: '#0f172a', margin: '0 0 12px',
          }}>Saved Cards</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cards.map(card => (
              <CardRow
                key={card.id}
                brand={card.brand}
                last4={card.last4}
                expires={card.expires}
                onRemove={() => {}}
              />
            ))}
          </div>
        </div>

        {/* Digital Wallets */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 18, color: '#0f172a', margin: '0 0 12px',
          }}>Digital Wallets</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <WalletRow name="Apple Pay" subtitle="Linked to iCloud account" icon="iOS" />
            <WalletRow name="Venmo" subtitle="@bruin-user" icon="venmo" />
          </div>
        </div>

        {/* Add new */}
        <button style={{
          width: '100%', height: 52, borderRadius: 16,
          background: '#2774ae', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 15, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(39,116,174,0.2)',
        }}>
          <span className="material-icons" style={{ fontSize: 18 }}>credit_card</span>
          Add New Payment Method
        </button>

        {/* Security note */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8',
          textAlign: 'center', marginTop: 16, lineHeight: 1.5,
        }}>
          Your payment information is encrypted and securely stored by our payment processor.
          BruinBazaar does not store full card details.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
