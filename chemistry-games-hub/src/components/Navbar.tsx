import React, { type ReactNode } from 'react';

interface NavbarProps {
  title: string;
  onBack?: () => void;
  rightContent?: ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ title, onBack, rightContent }) => {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        background: 'rgba(15, 10, 30, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(192, 132, 252, 0.15)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: back button + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                background: 'rgba(192, 132, 252, 0.1)',
                color: '#c084fc',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(192, 132, 252, 0.22)';
                b.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.background = 'rgba(192, 132, 252, 0.1)';
                b.style.transform = 'translateX(0)';
              }}
            >
              ←
            </button>
          )}

          {/* Title */}
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #e2d9f3 0%, #c084fc 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Right: branding + rightContent slot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Branding — hidden on small screens via inline <style> */}
          <span
            className="navbar-branding"
            style={{
              fontSize: '0.75rem',
              color: 'rgba(200, 170, 240, 0.6)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
          >
            Teacher Nourhan Zaher | Chemistry Games Hub
          </span>

          {rightContent && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {rightContent}
            </div>
          )}
        </div>
      </div>

      {/* Hide branding on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .navbar-branding {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
