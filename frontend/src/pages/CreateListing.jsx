import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CATEGORIES = ['Textbooks', 'Furniture', 'Electronics', 'Clothing', 'Tickets', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const MEETUP_SPOTS = ['The Hill', 'North Village', 'On-Campus', 'Westwood Village', 'Other'];
const URGENCY_TAGS = ['Moving out soon', 'Must go today', 'Price negotiable'];

export default function CreateListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [photos, setPhotos] = useState([]); // [{file, preview}]
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 fields
  const [meetupSpots, setMeetupSpots] = useState([]);
  const [urgencyTags, setUrgencyTags] = useState([]);
  const [bruinLift, setBruinLift] = useState(false);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...toAdd]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const validateStep1 = () => {
    if (!title.trim()) return 'Title is required';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) return 'Enter a valid price';
    if (!category) return 'Select a category';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (meetupSpots.length === 0) {
      setError('Select at least one meetup spot');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      // Upload photos
      const imageUrls = [];
      for (const photo of photos) {
        const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}_${photo.file.name}`);
        await uploadBytes(storageRef, photo.file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      // Save to Firestore
      await addDoc(collection(db, 'listings'), {
        userId: user.uid,
        sellerEmail: user.email,
        sellerName: user.displayName || user.email.split('@')[0],
        title: title.trim(),
        price: parseFloat(price),
        category,
        condition,
        description: description.trim(),
        meetupSpots,
        urgencyTags,
        bruinLift,
        imageUrls,
        imageUrl: imageUrls[0] || null,
        status: 'active',
        verified: true,
        createdAt: serverTimestamp(),
      });

      navigate('/', { state: { successMessage: 'Listing posted!' } });
    } catch (err) {
      console.error('Error posting listing:', err);
      setError('Failed to post listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArrayItem = (setter, arr, item) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  return (
    <div style={{
      background: '#fff', minHeight: '100vh',
      fontFamily: 'Inter, sans-serif', maxWidth: 480, margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ background: '#2774ae', padding: '44px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 56,
        }}>
          <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: 8,
          }}>
            <span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>arrow_back_ios_new</span>
          </button>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Create Listing</span>
          <div style={{ width: 40 }} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2774ae' }}>Step {step} of 2</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {step === 1 ? 'Photos & Details' : 'Location & Visibility'}
          </span>
        </div>
        <div style={{ background: '#f1f5f9', borderRadius: 9999, height: 6 }}>
          <div style={{
            background: '#2774ae', borderRadius: 9999, height: 6,
            width: step === 1 ? '50%' : '100%',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {error && (
        <div style={{
          margin: '12px 20px 0',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, padding: '10px 14px',
          fontSize: 13, color: '#dc2626',
        }}>{error}</div>
      )}

      {/* ---- STEP 1 ---- */}
      {step === 1 && (
        <div style={{ padding: '20px 20px 0' }}>
          {/* Photo upload */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Upload Photos</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />

            {photos.length === 0 ? (
              <button onClick={() => fileInputRef.current.click()} style={{
                width: '100%', height: 180, background: '#f8fafc',
                border: '2px dashed #cbd5e1', borderRadius: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 8, cursor: 'pointer',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#e9f1f7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ fontSize: 28, color: '#2774ae' }}>add_a_photo</span>
                </div>
                <span style={{ fontSize: 15, color: '#475569' }}>Add up to 5 photos</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Tap to select images</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {photos.map((photo, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={photo.preview} alt="" style={{
                      width: 80, height: 80, objectFit: 'cover', borderRadius: 10,
                    }} />
                    <button onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: '#ef4444', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                      <span className="material-icons" style={{ fontSize: 12, color: '#fff' }}>close</span>
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button onClick={() => fileInputRef.current.click()} style={{
                    width: 80, height: 80, background: '#f8fafc',
                    border: '2px dashed #cbd5e1', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <span className="material-icons" style={{ fontSize: 24, color: '#94a3b8' }}>add</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
              Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Comfy Blue Couch"
              maxLength={80}
              style={{
                width: '100%', height: 52, background: '#f8fafc',
                border: '1.5px solid transparent', borderRadius: 12,
                padding: '0 16px', fontSize: 16, fontFamily: 'Inter, sans-serif',
                color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#2774ae'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
          </div>

          {/* Price */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
              Price ($)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                fontSize: 16, color: '#64748b', fontFamily: 'Inter, sans-serif',
              }}>$</span>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                style={{
                  width: '100%', height: 52, background: '#f8fafc',
                  border: '1.5px solid transparent', borderRadius: 12,
                  paddingLeft: 32, paddingRight: 16, fontSize: 16,
                  fontFamily: 'Inter, sans-serif', color: '#0f172a',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2774ae'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
              Category
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%', height: 52, background: '#f8fafc',
                  border: '1.5px solid transparent', borderRadius: 12,
                  padding: '0 40px 0 16px', fontSize: 16,
                  fontFamily: 'Inter, sans-serif', color: category ? '#0f172a' : '#94a3b8',
                  outline: 'none', boxSizing: 'border-box', appearance: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#2774ae'}
                onBlur={e => e.target.style.borderColor = 'transparent'}
              >
                <option value="" disabled>Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="material-icons" style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 22, color: '#94a3b8', pointerEvents: 'none',
              }}>expand_more</span>
            </div>
          </div>

          {/* Condition */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
              Condition
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => setCondition(c)} style={{
                  padding: '8px 14px', borderRadius: 9999, fontSize: 12, cursor: 'pointer',
                  border: condition === c ? 'none' : '1px solid #e2e8f0',
                  background: condition === c ? '#2774ae' : '#fff',
                  color: condition === c ? '#fff' : '#475569',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  transition: 'all 0.15s',
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 100 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
              Description <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item — condition details, dimensions, why you're selling..."
              rows={4}
              maxLength={500}
              style={{
                width: '100%', background: '#f8fafc',
                border: '1.5px solid transparent', borderRadius: 12,
                padding: '14px 16px', fontSize: 15,
                fontFamily: 'Inter, sans-serif', color: '#0f172a',
                outline: 'none', boxSizing: 'border-box', resize: 'none',
                lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = '#2774ae'}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              {description.length}/500
            </div>
          </div>
        </div>
      )}

      {/* ---- STEP 2 ---- */}
      {step === 2 && (
        <div style={{ padding: '20px 20px 0' }}>
          {/* Review summary */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Review Summary</p>
            <div style={{
              background: '#f8fafc', borderRadius: 16, padding: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {photos[0] ? (
                <img src={photos[0].preview} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: 10, background: '#e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ color: '#94a3b8' }}>image</span>
                </div>
              )}
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{title}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#2774ae', margin: '0 0 4px' }}>${parseFloat(price || 0).toFixed(2)}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{category}</p>
              </div>
              <button onClick={() => setStep(1)} style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                cursor: 'pointer', color: '#2774ae',
              }}>
                <span className="material-icons" style={{ fontSize: 20 }}>edit</span>
              </button>
            </div>
          </div>

          {/* Meetup spots */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Meeting Location</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MEETUP_SPOTS.map(spot => (
                <button key={spot} onClick={() => toggleArrayItem(setMeetupSpots, meetupSpots, spot)} style={{
                  padding: '10px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                  border: meetupSpots.includes(spot) ? '2px solid #2774ae' : '1.5px solid #e2e8f0',
                  background: meetupSpots.includes(spot) ? '#eff6ff' : '#fff',
                  color: meetupSpots.includes(spot) ? '#2774ae' : '#334155',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  transition: 'all 0.15s',
                }}>{spot}</button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <span className="material-icons" style={{ fontSize: 14, color: '#94a3b8' }}>info</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Safe meeting spots recommended near these areas.</span>
            </div>
          </div>

          {/* Urgency tags */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Urgency Tag <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span>
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {URGENCY_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleArrayItem(setUrgencyTags, urgencyTags, tag)} style={{
                  padding: '8px 14px', borderRadius: 9999, fontSize: 12, cursor: 'pointer',
                  border: urgencyTags.includes(tag) ? 'none' : '1px solid #e2e8f0',
                  background: urgencyTags.includes(tag) ? '#ffd100' : '#fff',
                  color: urgencyTags.includes(tag) ? '#1e4d7b' : '#475569',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  transition: 'all 0.15s',
                }}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Bruin Lift toggle */}
          <div style={{ marginBottom: 100 }}>
            <div style={{
              background: '#f8fafc', borderRadius: 16, padding: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#e0f2fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-icons" style={{ fontSize: 22, color: '#0284c7' }}>local_shipping</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>I can help moving</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>I can assist with transport</p>
                </div>
              </div>
              <button
                onClick={() => setBruinLift(b => !b)}
                style={{
                  width: 48, height: 28, borderRadius: 14,
                  background: bruinLift ? '#2774ae' : '#e2e8f0',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}>
                <div style={{
                  position: 'absolute', top: 3, left: bruinLift ? 23 : 3,
                  width: 22, height: 22, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer button */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff', borderTop: '0.8px solid #f1f5f9',
        padding: '16px 20px 28px', boxSizing: 'border-box',
      }}>
        {step === 1 ? (
          <button onClick={handleNext} style={{
            width: '100%', height: 56, background: '#2774ae', borderRadius: 16, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 16, fontWeight: 700, color: '#fff', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            Next
            <span className="material-icons" style={{ fontSize: 16 }}>arrow_forward_ios</span>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} style={{
            width: '100%', height: 60, borderRadius: 16, border: 'none',
            background: submitting ? '#94a3b8' : '#2774ae',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 16, fontWeight: 700, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            {submitting ? 'Posting...' : 'Post Listing'}
            {!submitting && <span className="material-icons" style={{ fontSize: 20 }}>rocket_launch</span>}
          </button>
        )}
      </div>
    </div>
  );
}