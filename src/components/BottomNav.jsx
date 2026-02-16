import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'home',         label: 'Home',    path: '/' },
  { icon: 'campaign',     label: 'Bulletin', path: '/bulletin' },
  { icon: null,           label: 'Post',    path: '/create-listing', isCenter: true },
  { icon: 'chat_bubble',  label: 'Chats',   path: '/messages' },
  { icon: 'person',       label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: '#fff',
      borderTop: '0.8px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px 28px',
      zIndex: 100,
      boxSizing: 'border-box',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;

        if (item.isCenter) {
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#ffd100',
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -20,
              }}>
                <span className="material-icons" style={{ fontSize: 28, color: '#2774ae' }}>add</span>
              </div>
              <span style={{
                fontSize: 10,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: '#94a3b8',
              }}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 4px',
              color: isActive ? '#2774ae' : '#94a3b8',
            }}
          >
            <span className="material-icons" style={{ fontSize: 24 }}>{item.icon}</span>
            <span style={{
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
              fontWeight: isActive ? 700 : 500,
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}