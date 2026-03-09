/**
 * BruinBazaar — Help Center
 * Matches Figma node 202:639
 * Route: /help
 *
 * Sections: Search, Browse Categories (2x2 image grid),
 * Popular Topics (list), Contact Support CTA
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
      </div>
    </div>
  );
}

const HELP_CATEGORIES = [
  { label: 'Buying', icon: 'shopping_bag', gradient: 'linear-gradient(135deg, #1a5f96, #2774ae)' },
  { label: 'Selling', icon: 'sell', gradient: 'linear-gradient(135deg, #b5722a, #d4956b)' },
  { label: 'Safety', icon: 'shield', gradient: 'linear-gradient(135deg, #2d5a27, #4a8c42)' },
  { label: 'Account', icon: 'person', gradient: 'linear-gradient(135deg, #8b5a3c, #c4824a)' },
];

const POPULAR_TOPICS = [
  'How to arrange a campus meetup?',
  'Verification for UCLA students',
  'BruinBazaar Protection Policy',
];

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      fontFamily: 'Inter, sans-serif', background: '#fff',
      paddingBottom: 97,
    }}>
      <SubHeader title="Help Center" onBack={() => navigate('/profile')} />

      <div style={{ padding: '24px 16px' }}>
        {/* Heading */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 22, color: '#0f172a', margin: '0 0 16px',
        }}>How can we help?</p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <span className="material-icons" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 18, color: '#94a3b8', pointerEvents: 'none',
          }}>search</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search FAQs, guides, and more"
            style={{
              width: '100%', height: 44, borderRadius: 12,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              paddingLeft: 40, paddingRight: 16,
              fontSize: 14, color: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        {/* Browse Categories */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 16, color: '#0f172a', margin: '0 0 16px',
        }}>Browse Categories</p>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, marginBottom: 32,
        }}>
          {HELP_CATEGORIES.map(cat => (
            <button
              key={cat.label}
              style={{
                position: 'relative', height: 100, borderRadius: 12,
                overflow: 'hidden', border: 'none', cursor: 'pointer',
                background: cat.gradient,
                display: 'flex', alignItems: 'flex-end',
                padding: 12,
              }}
            >
              {/* Icon in top right */}
              <span className="material-icons" style={{
                position: 'absolute', top: 12, right: 12,
                fontSize: 28, color: 'rgba(255,255,255,0.3)',
              }}>{cat.icon}</span>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 700,
                fontSize: 14, color: '#fff',
              }}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Popular Topics */}
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 16, color: '#0f172a', margin: '0 0 12px',
        }}>Popular Topics</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
          {POPULAR_TOPICS.map((topic, i) => (
            <button
              key={topic}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '16px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                width: '100%', textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: 14,
                color: '#334155', flex: 1,
              }}>{topic}</span>
              <span className="material-icons" style={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }}>chevron_right</span>
            </button>
          ))}
        </div>

        {/* Contact Support */}
        <div style={{
          background: '#fff8f0', borderRadius: 16,
          padding: '24px 20px', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 16, color: '#0f172a', margin: '0 0 8px',
          }}>Still need help?</p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 13,
            color: '#64748b', margin: '0 0 16px', lineHeight: 1.5,
          }}>
            Our support team will get back to you as soon as possible.
          </p>
          <button style={{
            width: '100%', height: 48, borderRadius: 12,
            background: '#e85d26', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 15, color: '#fff',
          }}>Contact Support</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
