/**
 * BruinBazaar — Create ISO (In Search Of) Post
 * Mirrors CreateListing's 2-step flow, reuses the same sub-components.
 * ISO-specific: no photo upload required, "Max Budget" instead of "Price",
 * "found" flag instead of "sold", posts to isos/ collection.
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createISO } from '../services/isoService';
import { uploadListingPhotos } from '../services/storageService';
import { CATEGORIES, CONDITIONS, MEETUP_SPOTS } from '../constants/listings';
import BottomNav from '../components/BottomNav';

// ─── Shared constants ────────────────────────────────────────────────────────

const URGENCY_TAGS = ['Need ASAP', 'Flexible timeline', 'Price negotiable'];

// ─── Shared UI primitives (same style system as CreateListing) ───────────────

function TopBar({ onBack, title }) {
  return (
    <>
      <div style={{ height: 48, background: '#fff' }} />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: 78,
          background: '#fff',
          borderBottom: '0.8px solid #F1F5F9',
        }}
      >
        <button
          onClick={onBack}
          style={{
            width: 40,
            height: 46,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span className="material-icons" style={{ fontSize: 22, color: '#0F172A' }}>
            arrow_back_ios_new
          </span>
        </button>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 18,
            color: '#0F172A',
          }}
        >
          {title}
        </span>
        <div style={{ width: 40 }} />
      </header>
    </>
  );
}

function ProgressBar({ step, total, label }) {
  return (
    <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
          Step {step} of {total}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#2774AE', fontWeight: 600 }}>
          {label}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: '#F1F5F9', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(step / total) * 100}%`,
            background: '#2774AE',
            borderRadius: 9999,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <p
      style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 14,
        color: '#0F172A',
        marginBottom: 8,
      }}
    >
      {children}
      {required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
    </p>
  );
}

function TextInput({ placeholder, value, onChange, multiline, maxLength, type = 'text' }) {
  const shared = {
    width: '100%',
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: 12,
    fontFamily: 'Inter, sans-serif',
    fontSize: 15,
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };
  if (multiline) {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={4}
        style={{ ...shared, padding: '14px 16px', resize: 'none' }}
        onFocus={(e) => (e.target.style.borderColor = '#2774AE')}
        onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
      />
    );
  }
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      style={{ ...shared, padding: '14px 16px', height: 52 }}
      onFocus={(e) => (e.target.style.borderColor = '#2774AE')}
      onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          height: 52,
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: 12,
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          color: value ? '#0F172A' : '#94A3B8',
          padding: '0 40px 0 16px',
          appearance: 'none',
          outline: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <span
        className="material-icons"
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 20,
          color: '#94A3B8',
          pointerEvents: 'none',
        }}
      >
        expand_more
      </span>
    </div>
  );
}

function PillButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 9999,
        border: `1.5px solid ${active ? '#2774AE' : '#E2E8F0'}`,
        background: active ? '#EFF6FF' : '#fff',
        color: active ? '#2774AE' : '#64748B',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        height: 56,
        borderRadius: 16,
        background: disabled || loading ? '#94A3B8' : '#2774AE',
        border: 'none',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 16,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: disabled || loading ? 'none' : '0 10px 15px -3px rgba(39,116,174,0.2)',
        transition: 'background 0.15s',
      }}
    >
      {loading ? (
        <>
          <div
            style={{
              width: 18,
              height: 18,
              border: '3px solid rgba(255,255,255,0.4)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          Posting...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ─── ISO-specific: Optional photo upload (reference images) ─────────────────

function OptionalPhotoUpload({ photos, onAdd, onRemove }) {
  const inputRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    onAdd(files.slice(0, 3 - photos.length));
    e.target.value = '';
  };

  return (
    <div>
      <Label>Reference Photos <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional, max 3)</span></Label>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>
        Add photos of what you're looking for to help sellers understand.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {photos.map((p, i) => (
          <div
            key={i}
            style={{
              width: 88,
              height: 88,
              borderRadius: 12,
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <img
              src={URL.createObjectURL(p)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={() => onRemove(i)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-icons" style={{ fontSize: 14, color: '#fff' }}>close</span>
            </button>
          </div>
        ))}
        {photos.length < 3 && (
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              width: 88,
              height: 88,
              borderRadius: 12,
              border: '2px dashed #CBD5E1',
              background: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <span className="material-icons" style={{ fontSize: 24, color: '#94A3B8' }}>add_photo_alternate</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94A3B8' }}>Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />
    </div>
  );
}

// ─── Step 1: What you're looking for ─────────────────────────────────────────

function Step1({ form, setForm }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 20px' }}>
      {/* ISO badge */}
      <div
        style={{
          background: '#FFF7ED',
          border: '1.5px solid #FED7AA',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span className="material-icons" style={{ fontSize: 20, color: '#F97316', flexShrink: 0, marginTop: 1 }}>
          search
        </span>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: '#9A3412', marginBottom: 2 }}>
            ISO — In Search Of
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#C2410C', lineHeight: 1.5 }}>
            Post what you're looking for. Sellers who have it can message you directly.
          </p>
        </div>
      </div>

      {/* Title */}
      <div>
        <Label required>What are you looking for?</Label>
        <TextInput
          placeholder="e.g. IKEA KALLAX bookshelf, white or black"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          maxLength={100}
        />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', marginTop: 6, textAlign: 'right' }}>
          {form.title.length}/100
        </p>
      </div>

      {/* Category */}
      <div>
        <Label required>Category</Label>
        <SelectInput
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          options={CATEGORIES}
          placeholder="Select a category"
        />
      </div>

      {/* Max budget */}
      <div>
        <Label>Max Budget <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></Label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              color: '#64748B',
            }}
          >
            $
          </span>
          <input
            type="number"
            min={0}
            max={9999}
            placeholder="0.00"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            style={{
              width: '100%',
              height: 52,
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 12,
              fontFamily: 'Inter, sans-serif',
              fontSize: 15,
              color: '#0F172A',
              padding: '0 16px 0 32px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Preferred condition */}
      <div>
        <Label>Preferred Condition <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></Label>
        <SelectInput
          value={form.condition}
          onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
          options={CONDITIONS}
          placeholder="Any condition"
        />
      </div>

      {/* Description */}
      <div>
        <Label>More details</Label>
        <TextInput
          placeholder="Describe what you need — size, color, model, urgency, etc."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          multiline
          maxLength={500}
        />
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94A3B8', marginTop: 6, textAlign: 'right' }}>
          {form.description.length}/500
        </p>
      </div>

      {/* Reference photos */}
      <OptionalPhotoUpload
        photos={form.photos}
        onAdd={(files) => setForm((p) => ({ ...p, photos: [...p.photos, ...files] }))}
        onRemove={(i) => setForm((p) => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
      />
    </div>
  );
}

// ─── Step 2: Location & visibility ───────────────────────────────────────────

function Step2({ form, setForm }) {
  const toggleSpot = (spot) => {
    setForm((p) => ({
      ...p,
      meetupSpots: p.meetupSpots.includes(spot)
        ? p.meetupSpots.filter((s) => s !== spot)
        : [...p.meetupSpots, spot],
    }));
  };

  const toggleTag = (tag) => {
    setForm((p) => ({
      ...p,
      urgencyTags: p.urgencyTags.includes(tag)
        ? p.urgencyTags.filter((t) => t !== tag)
        : [...p.urgencyTags, tag],
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '24px 20px' }}>

      {/* Summary card */}
      <div
        style={{
          background: '#F8FAFC',
          border: '0.8px solid #E2E8F0',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {form.photos.length > 0 ? (
          <img
            src={URL.createObjectURL(form.photos[0])}
            alt=""
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              background: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-icons" style={{ fontSize: 28, color: '#94A3B8' }}>search</span>
          </div>
        )}
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
            {form.title || 'Untitled ISO'}
          </p>
          {form.price && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#2774AE', fontWeight: 600 }}>
              Budget: up to ${form.price}
            </p>
          )}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748B' }}>
            {form.category || 'Uncategorized'}
          </p>
        </div>
        <button
          onClick={() => {}}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        >
          <span className="material-icons" style={{ fontSize: 20, color: '#94A3B8' }}>edit</span>
        </button>
      </div>

      {/* Preferred meetup areas */}
      <div>
        <Label>Preferred Meetup Areas</Label>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>
          Where are you available to pick up?
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MEETUP_SPOTS.map((spot) => (
            <PillButton
              key={spot}
              label={spot}
              active={form.meetupSpots.includes(spot)}
              onClick={() => toggleSpot(spot)}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'flex-start',
            marginTop: 12,
            padding: '10px 12px',
            background: '#EFF6FF',
            borderRadius: 10,
          }}
        >
          <span className="material-icons" style={{ fontSize: 16, color: '#2774AE', marginTop: 1, flexShrink: 0 }}>
            info
          </span>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#1E40AF' }}>
            Safe meeting spots recommended near these areas.
          </p>
        </div>
      </div>

      {/* Urgency tags */}
      <div>
        <Label>Urgency <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></Label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {URGENCY_TAGS.map((tag) => (
            <PillButton
              key={tag}
              label={tag}
              active={form.urgencyTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>

      {/* Safety notice */}
      <div
        style={{
          background: '#F0FDF4',
          border: '1.5px solid #BBF7D0',
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}
      >
        <span className="material-icons" style={{ fontSize: 20, color: '#16A34A', flexShrink: 0, marginTop: 1 }}>
          verified_user
        </span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#15803D', lineHeight: 1.5 }}>
          Only verified UCLA students can respond to your ISO. Always meet in public campus spots.
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: '',
  photos: [],        // File[]
  meetupSpots: [],
  urgencyTags: [],
};

export default function CreateISO() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const step1Valid = form.title.trim().length > 0 && form.category;

  const handleNext = () => {
    if (step === 1 && !step1Valid) return;
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (step === 1) navigate(-1);
    else setStep(1);
  };

  const handlePost = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Upload reference photos if provided
      let photoUrls = [];
      if (form.photos.length > 0) {
        photoUrls = await uploadListingPhotos(form.photos, user.uid);
      }

      await createISO({
        userId: user.uid,
        sellerName: userProfile?.displayName || user.email?.split('@')[0] || 'UCLA Student',
        sellerYear: userProfile?.year || '',
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price ? Number(form.price) : null,
        category: form.category,
        condition: form.condition || null,
        photos: photoUrls,
        location: { lat: 34.0689, lng: -118.4452 }, // UCLA default
        meetupSpots: form.meetupSpots,
        urgencyTags: form.urgencyTags,
      });

      navigate('/', { state: { toastMessage: 'ISO posted! Sellers will reach out.' } });
    } catch (err) {
      console.error('CreateISO submit:', err);
      setError(err.message || 'Failed to post ISO. Please try again.');
      setLoading(false);
    }
  };

  const STEPS = [
    { label: "What You're Looking For" },
    { label: 'Location & Visibility' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#fff',
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
          background: '#fff',
          paddingBottom: 97,
        }}
      >
        <TopBar onBack={handleBack} title="Create ISO Post" />
        <ProgressBar step={step} total={2} label={STEPS[step - 1].label} />

        <div style={{ flex: 1 }}>
          {step === 1 ? (
            <Step1 form={form} setForm={setForm} />
          ) : (
            <Step2 form={form} setForm={setForm} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '0 20px 12px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#EF4444', textAlign: 'center' }}>
              {error}
            </p>
          </div>
        )}

        {/* Footer CTA */}
        <div
          style={{
            padding: '16px 20px 20px',
            borderTop: '0.8px solid #F1F5F9',
            background: '#fff',
          }}
        >
          {step === 1 ? (
            <PrimaryButton onClick={handleNext} disabled={!step1Valid}>
              Next
              <span className="material-icons" style={{ fontSize: 18 }}>arrow_forward_ios</span>
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={handlePost} loading={loading}>
              Post ISO
              <span className="material-icons" style={{ fontSize: 18 }}>campaign</span>
            </PrimaryButton>
          )}
        </div>
      </div>

      <BottomNav />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}