/**
 * BruinBazaar — Purchase History
 * Matches Figma node 202:280
 * Route: /purchases
 * Tabs: All Orders | Delivered | Ongoing | Cancelled
 * Note: This is a UI-ready screen. Actual purchase tracking requires
 * a transactions collection (out of scope for MVP).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const TABS = ['All Orders', 'Delivered', 'Ongoing', 'Cancelled'];

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

function TabBar({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none',
      borderBottom: '1px solid #e2e8f0', background: '#fff',
    }}>
      {TABS.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            flex: 'none', padding: '14px 16px', border: 'none', cursor: 'pointer',
            background: 'none', whiteSpace: 'nowrap',
            borderBottom: active === tab ? '2px solid #e85d26' : '2px solid transparent',
            fontFamily: 'Inter, sans-serif', fontWeight: active === tab ? 700 : 500,
            fontSize: 14, color: active === tab ? '#e85d26' : '#94a3b8',
          }}
        >{tab}</button>
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  const statusColor = order.status === 'DELIVERED' ? '#16a34a'
    : order.status === 'COMPLETED' ? '#64748b' : '#e85d26';

  return (
    <div style={{
      background: '#fff', borderRadius: 16, margin: '0 16px 12px',
      padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
      }}>
        <span className="material-icons" style={{ fontSize: 16, color: statusColor }}>
          {order.status === 'DELIVERED' ? 'check_circle' : 'schedule'}
        </span>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 12, color: statusColor,
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>{order.status}</span>
      </div>

      {/* Content row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 16, color: '#0f172a', margin: '0 0 4px',
          }}>{order.title}</p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8',
            margin: '0 0 6px',
          }}>
            Sold by {order.seller} {order.date ? `\u00B7 ${order.date}` : ''}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 18, color: '#e85d26', margin: 0,
          }}>${order.price.toFixed(2)}</p>
        </div>

        {/* Thumbnail */}
        <div style={{
          width: 80, height: 80, borderRadius: 10, overflow: 'hidden',
          background: '#f1f5f9', flexShrink: 0,
        }}>
          {order.image ? (
            <img src={order.image} alt={order.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-icons" style={{ fontSize: 28, color: '#cbd5e1' }}>image</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button style={{
          flex: 1, padding: '10px 0', borderRadius: 10,
          background: '#e85d26', border: 'none', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 13, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span className="material-icons" style={{ fontSize: 14 }}>receipt</span>
          View Receipt
        </button>
        <button style={{
          flex: 1, padding: '10px 0', borderRadius: 10,
          background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 13, color: '#475569',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <span className="material-icons" style={{ fontSize: 14 }}>chat</span>
          Seller
        </button>
      </div>
    </div>
  );
}

// Placeholder data — replace with Firestore queries when transactions collection exists
const MOCK_ORDERS = [
  { id: '1', title: 'UCLA Blue Hoodie (Size M)', seller: 'Joe Bruin', date: 'Oct 24, 2023', price: 35, status: 'DELIVERED', image: null },
  { id: '2', title: 'Organic Chemistry Textbook', seller: 'Michelle Liu', date: 'Oct 18, 2023', price: 85, status: 'DELIVERED', image: null },
  { id: '3', title: 'Bruin Football Ticket vs Stanford', seller: 'Arul Mathur', date: 'Sep 30, 2023', price: 25, status: 'COMPLETED', image: null },
];

export default function PurchaseHistoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Orders');

  // Filter mock data by tab
  const orders = activeTab === 'All Orders' ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === activeTab.toUpperCase());

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      fontFamily: 'Inter, sans-serif', background: '#f8fafc',
      paddingBottom: 97,
    }}>
      <SubHeader title="Purchase History" onBack={() => navigate('/profile')} />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <div style={{ paddingTop: 16 }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px' }}>
            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>receipt_long</span>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>No orders yet</p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              Your purchases will appear here.
            </p>
          </div>
        ) : (
          <>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 700,
              fontSize: 16, color: '#0f172a', padding: '0 16px', margin: '0 0 12px',
            }}>October 2023</p>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
