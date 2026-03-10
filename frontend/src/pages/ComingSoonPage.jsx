import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh', maxWidth: 480, margin: '0 auto',
      background: '#f8fafc', fontFamily: 'Inter, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ background: '#2774ae', padding: '44px 16px 16px' }}>
        <span style={{
          fontFamily: "'Jomhuria', serif", fontSize: 64, color: '#fff', lineHeight: 1,
        }}>BruinBazaar</span>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', gap: 16, textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#eff6ff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 8,
        }}>
          <span className="material-icons" style={{ fontSize: 40, color: '#2774ae' }}>construction</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Coming Soon
        </h1>

        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
          We're working hard to bring this feature to BruinBazaar. Check back soon!
        </p>

        <div style={{
          background: '#fff', borderRadius: 16, padding: 16,
          border: '1px solid #e2e8f0', width: '100%',
          boxSizing: 'border-box', marginTop: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="material-icons" style={{ fontSize: 20, color: '#ffd100' }}>star</span>
            <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
              In the meantime, browse listings or post your own!
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 8, width: '100%', height: 52,
            background: '#2774ae', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, color: '#fff',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}