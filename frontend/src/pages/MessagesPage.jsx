/**
 * BruinBazaar — Messages / Message Center
 * Matches Figma node 116:694
 * Loads real conversations from Firestore via chatService.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getConversations } from '../services/chatService';
import BottomNav from '../components/BottomNav';

// ─── Top Bar ────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div
      style={{
        background: '#2774AE',
        padding: '8px 16px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'Jomhuria, serif',
            fontSize: 52,
            color: '#fff',
            lineHeight: 1.1,
          }}
        >
          BruinBazaar
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={iconBtnStyle}>
            <span className="material-icons" style={{ color: '#fff', fontSize: 24 }}>search</span>
          </button>
          <button style={iconBtnStyle}>
            <span className="material-icons" style={{ color: '#fff', fontSize: 24 }}>shopping_cart</span>
          </button>
          <button style={{ ...iconBtnStyle, position: 'relative' }}>
            <span className="material-icons" style={{ color: '#fff', fontSize: 24 }}>notifications</span>
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FFD100',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
};

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Selling', 'Buying', 'Unread'];

function FilterTabs({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            padding: '8px 16px',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 14,
            whiteSpace: 'nowrap',
            background: active === f ? '#2774AE' : '#F1F5F9',
            color: active === f ? '#fff' : '#475569',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, photoURL, size = 56, showOnline = false }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#E2E8F0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: size * 0.3,
              color: '#64748B',
            }}
          >
            {initials}
          </span>
        )}
      </div>
      {showOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 0,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#22C55E',
            border: '2px solid #fff',
          }}
        />
      )}
    </div>
  );
}

// ─── Item Thumbnail ───────────────────────────────────────────────────────────

function ItemThumb({ photoURL }) {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 8,
        background: '#F1F5F9',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {photoURL ? (
        <img
          src={photoURL}
          alt="item"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span className="material-icons" style={{ fontSize: 24, color: '#CBD5E1' }}>
          image
        </span>
      )}
    </div>
  );
}

// ─── Conversation Row ─────────────────────────────────────────────────────────

function ConversationRow({ conversation, currentUserId, onClick }) {
  const {
    participants = [],
    listingTitle = '',
    lastMessage = '',
    lastMessageTime,
    unreadBy = [],
    otherUserName = 'Unknown',
    otherUserPhoto = null,
    listingPhoto = null,
    role = '',       // 'Buying' | 'Selling'
  } = conversation;

  const hasUnread = unreadBy.includes(currentUserId);

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        padding: '16px',
        background: 'none',
        border: 'none',
        borderTop: '1px solid #F1F5F9',
        width: '100%',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {/* Avatar */}
      <Avatar
        name={otherUserName}
        photoURL={otherUserPhoto}
        showOnline={false}
      />

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Name + time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: hasUnread ? 700 : 600,
              fontSize: 15,
              color: '#0F172A',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 160,
            }}
          >
            {otherUserName}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 12,
              color: '#94A3B8',
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            {formatTime(lastMessageTime)}
          </span>
        </div>

        {/* Listing label */}
        {listingTitle ? (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              color: '#2774AE',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {role}: {listingTitle}
          </span>
        ) : null}

        {/* Last message + unread badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: hasUnread ? 600 : 400,
              fontSize: 14,
              color: hasUnread ? '#0F172A' : '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {lastMessage || 'Start the conversation'}
          </span>
          {hasUnread && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#2774AE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 10,
                  color: '#fff',
                }}
              >
                {unreadBy.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Item thumbnail */}
      <ItemThumb photoURL={listingPhoto} />
    </button>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ filter }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        gap: 12,
      }}
    >
      <span className="material-icons" style={{ fontSize: 48, color: '#CBD5E1' }}>
        chat_bubble_outline
      </span>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 16,
          color: '#64748B',
          textAlign: 'center',
        }}
      >
        {filter === 'Unread' ? 'No unread messages' : 'No conversations yet'}
      </p>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          color: '#94A3B8',
          textAlign: 'center',
        }}
      >
        Message a seller from any listing to get started.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await getConversations(user.uid);

        // Enrich with role + placeholder other-user info
        // In production you'd batch-fetch user profiles; here we infer from listingTitle
        const enriched = raw.map((conv) => {
          const isSeller = conv.participants[0] === user.uid
            ? conv.sellerId === user.uid
            : conv.sellerId === user.uid;
          const role = isSeller ? 'Selling' : 'Buying';
          const otherUserId = conv.participants.find((id) => id !== user.uid);
          return {
            ...conv,
            role,
            otherUserId,
            otherUserName: conv.otherUserName || 'UCLA Student',
            otherUserPhoto: conv.otherUserPhoto || null,
            listingPhoto: conv.listingPhoto || null,
          };
        });

        setConversations(enriched);
      } catch (err) {
        console.error('MessagesPage load:', err);
        setError('Failed to load messages. Pull to refresh.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.uid]);

  // Filter
  const filtered = conversations.filter((conv) => {
    if (activeFilter === 'Selling' && conv.role !== 'Selling') return false;
    if (activeFilter === 'Buying' && conv.role !== 'Buying') return false;
    if (activeFilter === 'Unread' && !conv.unreadBy?.includes(user?.uid)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !conv.otherUserName?.toLowerCase().includes(q) &&
        !conv.listingTitle?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleConversationClick = (conv) => {
    navigate(`/messages/${conv.id}`, {
      state: {
        conversationId: conv.id,
        listingTitle: conv.listingTitle,
        otherUserName: conv.otherUserName,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F3F4F6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#F3F4F6',
        }}
      >
        {/* Status bar spacer */}
        <div style={{ height: 44, background: '#2774AE' }} />

        {/* Top Bar */}
        <TopBar />

        {/* White card body */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: 97, // BottomNav height
          }}
        >
          {/* Header: title + search + filters */}
          <div
            style={{
              padding: '12px 20px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: 12,
            }}
          >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  fontSize: 24,
                  color: '#0F172A',
                  letterSpacing: '-0.6px',
                }}
              >
                Messages
              </h1>
              <button
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-icons" style={{ fontSize: 20, color: '#64748B' }}>
                  more_horiz
                </span>
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span
                className="material-icons"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 18,
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 16,
                  background: '#F1F5F9',
                  border: 'none',
                  paddingLeft: 40,
                  paddingRight: 16,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filter tabs */}
            <FilterTabs active={activeFilter} onChange={setActiveFilter} />
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1 }}>
            {loading ? (
              // Skeleton
              <div style={{ padding: '16px' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '16px 0',
                      borderTop: i > 0 ? '1px solid #F1F5F9' : 'none',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: '#F1F5F9',
                        flexShrink: 0,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 16, width: '60%', borderRadius: 8, background: '#F1F5F9' }} />
                      <div style={{ height: 14, width: '80%', borderRadius: 8, background: '#F1F5F9' }} />
                      <div style={{ height: 14, width: '40%', borderRadius: 8, background: '#F1F5F9' }} />
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#F1F5F9', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  color: '#EF4444',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState filter={activeFilter} />
            ) : (
              filtered.map((conv, i) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  currentUserId={user?.uid}
                  onClick={() => handleConversationClick(conv)}
                />
              ))
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}