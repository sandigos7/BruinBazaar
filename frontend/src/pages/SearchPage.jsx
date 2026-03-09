/**
 * BruinBazaar — Search Page
 * Matches Figma node 231:1269 "Searched"
 * Route: /search (also handles ?q=... from bulletin board)
 *
 * Sections:
 *   1. Search bar with back button + clear
 *   2. Filter quick-bar (horizontal scroll pills)
 *   3. Recent Searches (persisted in sessionStorage)
 *   4. Trending Categories (2x2 grid)
 *   5. Advanced Filters (location, price range, condition)
 *   6. Search results grid (when query is active)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

// ─── Constants ───────────────────────────────────────────────────────────────

const LOCATIONS = ['The Hill', 'North Village', 'South Village', 'On-Campus'];
const CONDITIONS = ['New / Mint', 'Like New', 'Good', 'Fair'];
const QUICK_FILTERS = ['The Hill', 'Under $50', 'Like New', 'Bruin Lift'];
const CATEGORIES = [
  { label: 'Textbooks', icon: 'menu_book' },
  { label: 'Furniture', icon: 'chair' },
  { label: 'Electronics', icon: 'devices' },
  { label: 'Apparel', icon: 'checkroom' },
];

const MAX_RECENT = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRecentSearches() {
  try {
    return JSON.parse(sessionStorage.getItem('bb_recent_searches') || '[]');
  } catch { return []; }
}

function saveRecentSearch(term) {
  if (!term?.trim()) return;
  const recent = getRecentSearches().filter(s => s !== term.trim());
  recent.unshift(term.trim());
  sessionStorage.setItem('bb_recent_searches', JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  sessionStorage.removeItem('bb_recent_searches');
}

const iconBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
};

// ─── Search Header ───────────────────────────────────────────────────────────

function SearchHeader({ value, onChange, onSubmit, onBack, onClear }) {
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus search input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '16px 16px 8px',
    }}>
      <button onClick={onBack} style={{ ...iconBtn, flexShrink: 0 }}>
        <span className="material-icons" style={{ fontSize: 20, color: '#0f172a' }}>arrow_back</span>
      </button>
      <div style={{ flex: 1, position: 'relative' }}>
        <span className="material-icons" style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 18, color: '#94a3b8', pointerEvents: 'none',
        }}>search</span>
        <input
          ref={inputRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
          placeholder="Search items, textbooks, housing..."
          style={{
            width: '100%', height: 40, borderRadius: 12,
            background: '#f1f5f9', border: 'none',
            paddingLeft: 40, paddingRight: 36,
            fontSize: 14, color: '#0f172a',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box', outline: 'none',
          }}
        />
        {value && (
          <button onClick={onClear} style={{
            ...iconBtn, position: 'absolute', right: 8, top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#94a3b8' }}>close</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Filter Quick Bar ────────────────────────────────────────────────────────

function FilterQuickBar({ activeFilters, onToggle, onOpenAdvanced }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '12px 16px',
      overflowX: 'auto', scrollbarWidth: 'none',
      borderBottom: '1px solid #e2e8f0',
    }}>
      {/* Filters button */}
      <button onClick={onOpenAdvanced} style={{
        display: 'flex', gap: 4, alignItems: 'center',
        padding: '6px 12px', borderRadius: 9999,
        background: '#2774ae', border: 'none',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <span className="material-icons" style={{ fontSize: 12, color: '#fff' }}>tune</span>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 12, color: '#fff', whiteSpace: 'nowrap',
        }}>Filters</span>
      </button>

      {QUICK_FILTERS.map(f => {
        const active = activeFilters.includes(f);
        return (
          <button
            key={f}
            onClick={() => onToggle(f)}
            style={{
              padding: '7px 13px', borderRadius: 9999, flexShrink: 0,
              border: active ? '1px solid #2774ae' : '1px solid #e2e8f0',
              background: active ? 'rgba(39,116,174,0.05)' : '#fff',
              cursor: 'pointer',
            }}
          >
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 12, color: active ? '#2774ae' : '#0f172a',
              whiteSpace: 'nowrap',
            }}>{f}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Recent Searches ─────────────────────────────────────────────────────────

function RecentSearches({ searches, onSelect, onClearAll }) {
  if (!searches.length) return null;
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 14, color: '#64748b',
          letterSpacing: '0.7px', textTransform: 'uppercase',
        }}>Recent Searches</span>
        <button onClick={onClearAll} style={{
          ...iconBtn, padding: 0,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 12, color: '#2774ae',
          }}>Clear All</span>
        </button>
      </div>
      {searches.map((term, i) => (
        <button
          key={term}
          onClick={() => onSelect(term)}
          style={{
            display: 'flex', gap: 12, alignItems: 'center',
            padding: '8px 0', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
            textAlign: 'left',
          }}
        >
          <span className="material-icons" style={{ fontSize: 14, color: '#94a3b8' }}>history</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 500,
            fontSize: 14, color: '#0f172a',
          }}>{term}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Trending Categories ─────────────────────────────────────────────────────

function TrendingCategories({ onSelect }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <span style={{
        fontFamily: 'Inter, sans-serif', fontWeight: 700,
        fontSize: 14, color: '#64748b',
        letterSpacing: '0.7px', textTransform: 'uppercase',
        display: 'block', marginBottom: 16,
      }}>Trending Categories</span>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => onSelect(cat.label)}
            style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              alignItems: 'center', padding: 13,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: 12, cursor: 'pointer',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(39,116,174,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-icons" style={{ fontSize: 20, color: '#2774ae' }}>
                {cat.icon}
              </span>
            </div>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 12, color: '#0f172a',
            }}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Advanced Filters ────────────────────────────────────────────────────────

function AdvancedFilters({ filters, setFilters }) {
  const { location, priceMax, conditions } = filters;

  const toggleCondition = (c) => {
    setFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(c)
        ? prev.conditions.filter(x => x !== c)
        : [...prev.conditions, c],
    }));
  };

  return (
    <div style={{
      padding: '24px 16px 0', borderTop: '1px solid #e2e8f0',
    }}>
      <span style={{
        fontFamily: 'Inter, sans-serif', fontWeight: 700,
        fontSize: 18, color: '#0f172a', display: 'block',
        marginBottom: 24,
      }}>Advanced Filters</span>

      {/* UCLA Region */}
      <div style={{ marginBottom: 32 }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 14, color: '#334155', display: 'block', marginBottom: 12,
        }}>UCLA Region</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {LOCATIONS.map(loc => {
            const active = location === loc;
            return (
              <button
                key={loc}
                onClick={() => setFilters(prev => ({ ...prev, location: active ? '' : loc }))}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  background: active ? '#2774ae' : '#f1f5f9',
                  border: active ? 'none' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 700,
                  fontSize: 12, color: active ? '#fff' : '#475569',
                }}>{loc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 14, color: '#334155',
          }}>Price Range</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 12, color: '#2774ae',
          }}>$0 - ${priceMax}</span>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          step={10}
          value={priceMax}
          onChange={e => setFilters(prev => ({ ...prev, priceMax: Number(e.target.value) }))}
          style={{
            width: '100%', height: 8,
            appearance: 'none', background: '#e2e8f0',
            borderRadius: 9999, outline: 'none',
            accentColor: '#2774ae',
          }}
        />
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 4,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 10, color: '#94a3b8', textTransform: 'uppercase',
          }}>Min</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700,
            fontSize: 10, color: '#94a3b8', textTransform: 'uppercase',
          }}>Max</span>
        </div>
      </div>

      {/* Condition */}
      <div style={{ marginBottom: 32 }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 14, color: '#334155', display: 'block', marginBottom: 12,
        }}>Condition</span>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {CONDITIONS.map(c => {
            const checked = filters.conditions.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCondition(c)}
                style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  padding: 13, borderRadius: 12,
                  border: checked ? '2px solid #2774ae' : '1px solid #e2e8f0',
                  background: checked ? 'rgba(39,116,174,0.05)' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: checked ? '#2774ae' : '#fff',
                  border: checked ? 'none' : '1px solid #6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {checked && (
                    <span className="material-icons" style={{ fontSize: 14, color: '#fff' }}>check</span>
                  )}
                </div>
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: checked ? 700 : 500,
                  fontSize: 14, color: '#0f172a',
                }}>{c}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Search Result Card (reuses selling card pattern) ────────────────────────

function ResultCard({ listing, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 16,
      border: '0.8px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      overflow: 'hidden', cursor: 'pointer',
    }}>
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        background: '#f1f5f9',
      }}>
        {(listing.imageUrl || listing.imageUrls?.[0]) ? (
          <img
            src={listing.imageUrl || listing.imageUrls?.[0]}
            alt={listing.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons" style={{ fontSize: 40, color: '#cbd5e1' }}>image</span>
          </div>
        )}
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
        }}>
          <span style={{
            color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', flex: 1, marginRight: 4,
          }}>{listing.title}</span>
          <span style={{ color: '#2774ae', flexShrink: 0 }}>${listing.price}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="material-icons" style={{ fontSize: 13, color: '#94a3b8' }}>location_on</span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b',
          }}>{listing.meetupSpots?.[0] || 'On-Campus'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main SearchPage ─────────────────────────────────────────────────────────

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(!!initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [activeQuickFilters, setActiveQuickFilters] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    location: '',
    priceMax: 150,
    conditions: [],
  });

  // Run search when initial query exists
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = useCallback(async (term) => {
    if (!term?.trim()) return;
    setLoading(true);
    setSubmitted(true);
    saveRecentSearch(term.trim());
    setRecentSearches(getRecentSearches());

    try {
      // Client-side search: fetch active listings and filter by title
      // (Firestore doesn't support full-text search natively)
      const q = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(40)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lower = term.trim().toLowerCase();
      const filtered = all.filter(l =>
        l.title?.toLowerCase().includes(lower) ||
        l.description?.toLowerCase().includes(lower) ||
        l.category?.toLowerCase().includes(lower)
      );
      setResults(filtered);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = () => {
    if (searchQuery.trim()) {
      runSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSubmitted(false);
    setResults([]);
  };

  const handleSelectRecent = (term) => {
    setSearchQuery(term);
    runSearch(term);
  };

  const handleSelectCategory = (cat) => {
    setSearchQuery(cat);
    runSearch(cat);
  };

  const toggleQuickFilter = (f) => {
    setActiveQuickFilters(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      fontFamily: 'Inter, sans-serif', background: '#f6f7f8',
      paddingBottom: 97,
    }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ height: 44 }} /> {/* Status bar spacer */}
        <SearchHeader
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSubmit}
          onBack={() => navigate(-1)}
          onClear={handleClear}
        />
        <FilterQuickBar
          activeFilters={activeQuickFilters}
          onToggle={toggleQuickFilter}
          onOpenAdvanced={() => setShowAdvanced(s => !s)}
        />
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 16 }}>
        {submitted && loading ? (
          /* Loading */
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            padding: '0 16px',
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                background: '#e2e8f0', borderRadius: 16,
                aspectRatio: '1/1.3',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : submitted && results.length > 0 ? (
          /* Results */
          <div style={{ padding: '0 16px' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 14, color: '#64748b', display: 'block', marginBottom: 12,
            }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            }}>
              {results.map(listing => (
                <ResultCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/listings/${listing.id}`)}
                />
              ))}
            </div>
          </div>
        ) : submitted && !loading ? (
          /* No results */
          <div style={{
            textAlign: 'center', padding: '48px 32px',
          }}>
            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', display: 'block', marginBottom: 12 }}>
              search_off
            </span>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>
              No results for "{searchQuery}"
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
              Try a different search term or browse categories below.
            </p>
          </div>
        ) : (
          /* Default: recent searches + categories + advanced filters */
          <>
            <RecentSearches
              searches={recentSearches}
              onSelect={handleSelectRecent}
              onClearAll={handleClearRecent}
            />
            <TrendingCategories onSelect={handleSelectCategory} />
            <AdvancedFilters
              filters={advancedFilters}
              setFilters={setAdvancedFilters}
            />
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #2774ae;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
        }
      `}</style>

      <BottomNav />
    </div>
  );
}