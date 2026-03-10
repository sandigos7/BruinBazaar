/**
 * BruinBazaar — Active Messaging / Chat
 * Matches Figma node 130:215
 * Route: /messages/:conversationId
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Shared style constants ───────────────────────────────────────────────────

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 0, display: 'flex', alignItems: 'center',
};

// ─── Top Bar (matches other pages exactly) ────────────────────────────────────

function TopBar() {
  return (
    <div style={{ background: '#2774AE', padding: '8px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Jomhuria, serif', fontSize: 52, color: '#fff', lineHeight: 1.1 }}>
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
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 8, height: 8, borderRadius: '50%', background: '#FFD100',
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ displayName, photoURL, size = 40, online = false }) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(displayName || '?');

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: '#2774AE', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {photoURL && !imgError ? (
          <img
            src={photoURL}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: size * 0.3, color: '#fff',
          }}>
            {initials}
          </span>
        )}
      </div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size <= 28 ? 9 : 12, height: size <= 28 ? 9 : 12,
          borderRadius: '50%', background: '#22C55E', border: '2px solid #fff',
        }} />
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn, showAvatar, otherUser }) {
  if (isOwn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, paddingLeft: 48 }}>
        <div style={{
          background: '#2774AE', color: '#fff',
          padding: '10px 12px',
          borderRadius: '16px 16px 4px 16px',
          maxWidth: '85%',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14,
            lineHeight: '22.75px', margin: 0, whiteSpace: 'pre-wrap',
          }}>
            {message.text}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 4 }}>
          {message.read && (
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94A3B8' }}>
              Read
            </span>
          )}
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94A3B8' }}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: '85%' }}>
      {/* Avatar slot — always reserves width so bubbles stay aligned */}
      <div style={{ flexShrink: 0, width: 28, alignSelf: 'flex-end' }}>
        {showAvatar && (
          <Avatar displayName={otherUser?.displayName || '?'} photoURL={otherUser?.photoURL} size={28} />
        )}
      </div>
      <div>
        <div style={{
          background: '#F1F5F9', color: '#1E293B',
          padding: '10px 12px',
          borderRadius: '16px 16px 16px 4px',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14,
            lineHeight: '22.75px', margin: 0, whiteSpace: 'pre-wrap',
          }}>
            {message.text}
          </p>
        </div>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#94A3B8',
          display: 'block', marginTop: 2,
        }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Optimistic data passed via navigate() state — renders name immediately
  // before the Firestore fetch completes
  const stateData = location.state || {};

  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(
    stateData.otherUserName ? { displayName: stateData.otherUserName } : null
  );
  const [listing, setListing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [safetyDismissed, setSafetyDismissed] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversation doc + other user profile + listing thumbnail
  useEffect(() => {
    if (!conversationId) return;
    const unsub = onSnapshot(doc(db, 'conversations', conversationId), async (snap) => {
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };
      setConversation(data);

      const otherId = data.participants.find((id) => id !== user?.uid);
      if (otherId) {
        const userSnap = await getDoc(doc(db, 'users', otherId));
        if (userSnap.exists()) setOtherUser({ uid: otherId, ...userSnap.data() });
      }

      if (data.listingId) {
        const listingSnap = await getDoc(doc(db, 'listings', data.listingId));
        if (listingSnap.exists()) setListing({ id: listingSnap.id, ...listingSnap.data() });
      }
    });
    return unsub;
  }, [conversationId, user?.uid]);

  // Real-time messages
  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear unread count when conversation is open
  useEffect(() => {
    if (!conversationId || !user) return;
    updateDoc(doc(db, 'conversations', conversationId), { unreadBy: [] }).catch(() => {});
  }, [conversationId, user, messages.length]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');
    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadBy: conversation?.participants?.filter((id) => id !== user.uid) ?? [],
      });
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleRequestMeetup() {
    const spots = listing?.meetupSpots?.join(', ') || 'Powell Library, Ackerman Union, De Neve';
    setInputText(`Can we meet up? Suggested spots: ${spots}`);
    inputRef.current?.focus();
  }

  // Show avatar only on the last consecutive received message in a group
  function shouldShowAvatar(index) {
    const current = messages[index];
    const next = messages[index + 1];
    return current.senderId !== user?.uid && (!next || next.senderId !== current.senderId);
  }

  const listingPhoto = listing?.photos?.[0];
  const displayName = otherUser?.displayName || stateData.otherUserName || 'UCLA Student';

  return (
    <div style={{
      minHeight: '100vh', background: '#F3F4F6',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', background: '#F3F4F6',
      }}>
        {/* Status bar spacer */}
        <div style={{ height: 44, background: '#2774AE' }} />

        <TopBar />

        {/* Chat panel */}
        <div style={{
          flex: 1, background: '#fff',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column',
          overflow: 'visible', paddingBottom: 97,
        }}>

          {/* Chat header */}
          <div style={{ borderBottom: '1px solid #F1F5F9', padding: '8px 16px 9px', flexShrink: 0, position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => navigate(-1)} style={iconBtnStyle} aria-label="Go back">
                  <span className="material-icons" style={{ fontSize: 20, color: '#475569' }}>
                    arrow_back_ios_new
                  </span>
                </button>
                <Avatar displayName={displayName} photoURL={otherUser?.photoURL} size={40} online />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
                    {displayName}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 11, color: '#22C55E' }}>
                    Online
                  </span>
                </div>
              </div>

              {listing && (
                <div style={{
                  background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12,
                  padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {listingPhoto ? (
                    <img
                      src={listingPhoto} alt={listing.title}
                      style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="material-icons" style={{ fontSize: 22, color: '#CBD5E1' }}>image</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Safety banner */}
          {!safetyDismissed && (
            <div style={{
              background: '#2774AE', padding: '9px 16px 10px',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <span className="material-icons" style={{ color: '#fff', fontSize: 16 }}>shield</span>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 13, color: '#fff', flex: 1, margin: 0,
              }}>
                Safety Tip: Meet in public, well-lit areas.
              </p>
              <button
                onClick={() => setSafetyDismissed(true)}
                style={{ ...iconBtnStyle, color: 'rgba(255,255,255,0.7)', fontSize: 20 }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {/* Messages scroll area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{
                  background: '#F1F5F9', color: '#94A3B8',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600,
                  fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '4px 12px', borderRadius: 9999,
                }}>
                  Today
                </span>
              </div>
            )}

            {messages.length === 0 && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '64px 0',
              }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#CBD5E1' }}>chat_bubble_outline</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#94A3B8' }}>
                  No messages yet. Say hi!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === user?.uid}
                showAvatar={shouldShowAvatar(i)}
                otherUser={otherUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
<div style={{
  borderTop: '1px solid #F1F5F9', background: '#fff',
  padding: '16px 16px 24px', flexShrink: 0,
  display: 'flex', flexDirection: 'column', gap: 12,
  position: 'sticky', bottom: 90,
}}>
            <button
              onClick={handleRequestMeetup}
              style={{
                width: '100%', height: 40, borderRadius: 12,
                background: '#FFD100', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: '#2774AE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>event</span>
              Request Meetup
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{ ...iconBtnStyle, width: 40, height: 40, justifyContent: 'center' }} aria-label="Add">
                <span className="material-icons" style={{ fontSize: 22, color: '#94A3B8' }}>add_circle_outline</span>
              </button>
              <button style={{ ...iconBtnStyle, width: 40, height: 40, justifyContent: 'center' }} aria-label="Camera">
                <span className="material-icons" style={{ fontSize: 22, color: '#94A3B8' }}>photo_camera</span>
              </button>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#F1F5F9', border: 'none', outline: 'none',
                    borderRadius: 16, padding: '11px 40px 11px 16px',
                    fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#0F172A',
                    resize: 'none', maxHeight: 120, lineHeight: '17px',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || sending}
                  style={{
                    ...iconBtnStyle,
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    color: inputText.trim() && !sending ? '#2774AE' : '#CBD5E1',
                    transition: 'color 0.15s',
                  }}
                  aria-label="Send"
                >
                  <svg width="19" height="16" viewBox="0 0 19 16" fill="currentColor">
                    <path d="M0.5 16L19 8L0.5 0L0.5 6L13.5 8L0.5 10L0.5 16Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </div>
  );
}