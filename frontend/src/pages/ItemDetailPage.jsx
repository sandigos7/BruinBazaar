/**
 * BruinBazaar — Item Detail / Selected Item
 * Matches Figma node 112:181
 * Props / route: /listings/:listingId
 * Shows buyer view by default; seller gets Mark Sold / Delete controls instead.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getListing, markListingSold, deleteListing } from '../services/listingsService';
import { getOrCreateConversation } from '../services/chatService';
import BottomNav from '../components/BottomNav';

// ─── Top Bar ────────────────────────────────────────────────────────────────

function TopBar({ onBack, onWishlist, onShare }) {
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

// ─── Photo Carousel ──────────────────────────────────────────────────────────

function PhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0);

  if (!photos?.length) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <span className="material-icons" style={{ fontSize: 64, color: '#CBD5E1' }}>image</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img
        src={photos[index]}
        alt={`Photo ${index + 1}`}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          objectFit: 'cover',
          display: 'block',
          borderRadius: '12px 12px 0 0',
        }}
      />
      {/* Dot indicators */}
      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? 20 : 8,
                height: 8,
                borderRadius: 9999,
                background: i === index ? '#2774AE' : 'rgba(255,255,255,0.7)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating = 4.9 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 14,
          color: '#0F172A',
        }}
      >
        {rating.toFixed(1)}
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="material-icons"
            style={{
              fontSize: 12,
              color: i < Math.round(rating) ? '#FFD100' : '#E2E8F0',
            }}
          >
            star
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Seller Card ─────────────────────────────────────────────────────────────

function SellerCard({ sellerName, sellerYear, rating = 4.9, onViewProfile }) {
  const initials = sellerName
    ? sellerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div
      style={{
        background: '#F8FAFC',
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 2px #fff',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              color: '#64748B',
            }}
          >
            {initials}
          </span>
        </div>
        {/* Name + rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                color: '#0F172A',
              }}
            >
              {sellerName}
            </span>
            {/* Verified badge */}
            <span className="material-icons" style={{ fontSize: 16, color: '#2774AE' }}>
              verified
            </span>
          </div>
          <StarRating rating={rating} />
        </div>
      </div>
      {/* View Profile */}
      <button
        onClick={onViewProfile}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          color: '#2774AE',
          padding: '4px 8px',
        }}
      >
        View Profile
      </button>
    </div>
  );
}

// ─── Info Row (Delivery / Pickup / Verified) ──────────────────────────────────

function InfoRow({ iconName, iconBg, iconColor, title, subtitle, accent = false, chevron = false, onPress }) {
  return (
    <button
      onClick={onPress}
      disabled={!onPress}
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        background: accent ? 'rgba(239,246,255,0.5)' : '#F8FAFC',
        border: accent ? '1px solid #DBEAFE' : 'none',
        width: '100%',
        cursor: onPress ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span className="material-icons" style={{ fontSize: 20, color: iconColor }}>
          {iconName}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: accent ? '#2774AE' : '#0F172A',
            marginBottom: 2,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 12,
            color: '#64748B',
          }}
        >
          {subtitle}
        </p>
      </div>
      {chevron && (
        <span className="material-icons" style={{ fontSize: 16, color: '#94A3B8', flexShrink: 0 }}>
          chevron_right
        </span>
      )}
    </button>
  );
}

// ─── Condition Badge ──────────────────────────────────────────────────────────

const CONDITION_COLORS = {
  New:       { bg: '#DCFCE7', color: '#16A34A' },
  'Like New': { bg: '#D1FAE5', color: '#059669' },
  Good:      { bg: '#FEF3C7', color: '#D97706' },
  Fair:      { bg: '#FEE2E2', color: '#DC2626' },
  Poor:      { bg: '#F1F5F9', color: '#64748B' },
};

function ConditionBadge({ condition }) {
  const style = CONDITION_COLORS[condition] || CONDITION_COLORS.Fair;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 9999,
      }}
    >
      {condition}
    </span>
  );
}

// ─── Bottom CTA Bar ──────────────────────────────────────────────────────────

function BuyerCTA({ price, onMessage, loading }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        padding: '20px',
        background: '#F8FAFC',
        borderTop: '1px solid #F1F5F9',
      }}
    >
      {/* Save / wishlist */}
      <button
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          border: '2px solid #F1F5F9',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <span className="material-icons" style={{ fontSize: 22, color: '#64748B' }}>
          favorite_border
        </span>
      </button>
      {/* Buy Now */}
      <button
        onClick={onMessage}
        disabled={loading}
        style={{
          flex: 1,
          height: 56,
          borderRadius: 16,
          background: loading ? '#94A3B8' : '#2774AE',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          color: '#fff',
          boxShadow: '0 10px 15px -3px rgba(39,116,174,0.2)',
          transition: 'background 0.15s',
        }}
      >
        {loading ? 'Opening chat...' : `$${price} — Message Seller`}
      </button>
    </div>
  );
}

function SellerCTA({ onMarkSold, onDelete, loadingSold, loadingDelete, sold }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '20px',
        background: '#F8FAFC',
        borderTop: '1px solid #F1F5F9',
      }}
    >
      <button
        onClick={onMarkSold}
        disabled={loadingSold || sold}
        style={{
          flex: 1,
          height: 56,
          borderRadius: 16,
          background: sold ? '#94A3B8' : '#2774AE',
          border: 'none',
          cursor: sold || loadingSold ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 15,
          color: '#fff',
        }}
      >
        {sold ? 'Marked as Sold' : loadingSold ? 'Updating...' : 'Mark as Sold'}
      </button>
      <button
        onClick={onDelete}
        disabled={loadingDelete}
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          border: '2px solid #FEE2E2',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: loadingDelete ? 'not-allowed' : 'pointer',
          flexShrink: 0,
        }}
      >
        <span className="material-icons" style={{ fontSize: 22, color: '#EF4444' }}>
          delete_outline
        </span>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ItemDetailPage() {
  const { listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getListing(listingId);
        if (!data) {
          setError('Listing not found.');
        } else {
          setListing(data);
        }
      } catch (err) {
        setError('Failed to load listing.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId]);

  const isSeller = listing && user && listing.userId === user.uid;

  const handleMessageSeller = async () => {
    if (!user || !listing) return;
    setMessagingLoading(true);
    try {
      const conv = await getOrCreateConversation(
        user.uid,
        listing.userId,
        listing.id,
        listing.title
      );
      navigate(`/messages/${conv.id}`, {
        state: {
          conversationId: conv.id,
          listingTitle: listing.title,
          otherUserName: listing.sellerName,
        },
      });
    } catch (err) {
      console.error('handleMessageSeller:', err);
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleMarkSold = async () => {
    if (!listing) return;
    setMarkingSold(true);
    try {
      await markListingSold(listing.id);
      setListing((prev) => ({ ...prev, sold: true }));
    } catch (err) {
      console.error('handleMarkSold:', err);
    } finally {
      setMarkingSold(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    const confirmed = window.confirm('Delete this listing? This cannot be undone.');
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteListing(listing.id, user.uid, listing.photos);
      navigate('/');
    } catch (err) {
      console.error('handleDelete:', err);
      setDeleting(false);
    }
  };

  // ── Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '4px solid #2774AE',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error state
  if (error || !listing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
        }}
      >
        <span className="material-icons" style={{ fontSize: 48, color: '#CBD5E1' }}>
          error_outline
        </span>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748B', textAlign: 'center' }}>
          {error || 'Listing not found.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            borderRadius: 12,
            background: '#2774AE',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
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
          position: 'relative',
          background: '#F8FAFC',
        }}
      >
        {/* Status bar spacer */}
        <div style={{ height: 44, background: '#2774AE' }} />

        {/* Top Bar */}
        <TopBar />

        {/* Sub-header: back + title + actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px 8px',
            background: '#F8FAFC',
            backdropFilter: 'blur(10px)',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span className="material-icons" style={{ fontSize: 22, color: '#0F172A' }}>
              arrow_back_ios_new
            </span>
          </button>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 18,
              color: '#0F172A',
            }}
          >
            Item Details
          </h2>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="material-icons" style={{ fontSize: 22, color: '#0F172A' }}>
                favorite_border
              </span>
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="material-icons" style={{ fontSize: 22, color: '#0F172A' }}>
                share
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: 97 + 56 + 16, // BottomNav + CTA bar + spacing
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '0 16px',
            paddingBottom: 200,
          }}
        >
          {/* Main card: photo + description */}
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              border: '0.8px solid #F1F5F9',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Photo carousel */}
            <PhotoCarousel photos={listing.imageUrls || (listing.imageUrl ? [listing.imageUrl] : [])} />

            {/* Info section */}
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Title + price */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#0F172A',
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  {listing.title}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#2774AE',
                    flexShrink: 0,
                  }}
                >
                  ${listing.price}
                </span>
              </div>

              {/* Condition + category pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {listing.condition && <ConditionBadge condition={listing.condition} />}
                {listing.category && (
                  <span
                    style={{
                      background: '#EFF6FF',
                      color: '#2774AE',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 9999,
                    }}
                  >
                    {listing.category}
                  </span>
                )}
                {listing.sold && (
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#16A34A',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 9999,
                    }}
                  >
                    SOLD
                  </span>
                )}
              </div>

              {/* Seller card */}
              <SellerCard
                sellerName={listing.sellerName || 'UCLA Student'}
                sellerYear={listing.sellerYear}
                rating={4.9}
                onViewProfile={() => {}}
              />

              {/* Description */}
              <div style={{ paddingTop: 8 }}>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#1E293B',
                    marginBottom: 6,
                  }}
                >
                  Description
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    color: '#475569',
                    lineHeight: 1.6,
                  }}
                >
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
            {/* Delivery */}
            <InfoRow
              iconName="local_shipping"
              iconBg="rgba(39,116,174,0.1)"
              iconColor="#2774AE"
              title="Delivery Help Available"
              subtitle="Seller can help with delivery if needed"
              accent
              chevron
            />

            {/* Pickup locations */}
            {listing.meetupSpots?.length > 0 && (
              <InfoRow
                iconName="location_on"
                iconBg="#E2E8F0"
                iconColor="#64748B"
                title="Pick-up Location"
                subtitle={listing.meetupSpots.join(', ')}
                chevron
              />
            )}

            {/* Verified */}
            <InfoRow
              iconName="verified_user"
              iconBg="#DCFCE7"
              iconColor="#16A34A"
              title="Verified Transaction"
              subtitle="Secure UCLA-only payment & safety guarantee."
            />
          </div>
        </div>

        {/* Sticky CTA bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 97,          // sit above BottomNav
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 480,
            zIndex: 50,
          }}
        >
          {isSeller ? (
            <SellerCTA
              onMarkSold={handleMarkSold}
              onDelete={handleDelete}
              loadingSold={markingSold}
              loadingDelete={deleting}
              sold={listing.sold}
            />
          ) : (
            <BuyerCTA
              price={listing.price}
              onMessage={handleMessageSeller}
              loading={messagingLoading}
            />
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}