import React from 'react';

export type ChemIconType = 'atom' | 'beaker' | 'molecule' | 'periodic' | 'flask' | 'bubble';

interface ChemIconProps {
  type: ChemIconType;
  size?: number;
  color?: string;
}

const ChemIcon: React.FC<ChemIconProps> = ({ type, size = 40, color = '#c084fc' }) => {
  const viewBox = '0 0 40 40';
  const common = {
    fill: 'none' as const,
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const renderIcon = () => {
    switch (type) {
      case 'atom':
        return (
          <>
            {/* Nucleus */}
            <circle cx="20" cy="20" r="3" fill={color} stroke="none" />
            {/* Three orbital ellipses */}
            <ellipse cx="20" cy="20" rx="14" ry="5" {...common} strokeWidth="1.5" />
            <ellipse cx="20" cy="20" rx="14" ry="5" {...common} strokeWidth="1.5"
              transform="rotate(60 20 20)" />
            <ellipse cx="20" cy="20" rx="14" ry="5" {...common} strokeWidth="1.5"
              transform="rotate(120 20 20)" />
            {/* Electrons */}
            <circle cx="34" cy="20" r="1.5" fill={color} stroke="none" />
            <circle cx="13" cy="8" r="1.5" fill={color} stroke="none" />
            <circle cx="13" cy="32" r="1.5" fill={color} stroke="none" />
          </>
        );

      case 'beaker':
        return (
          <>
            {/* Beaker body */}
            <path d="M13 6 L13 22 L7 34 L33 34 L27 22 L27 6 Z" {...common} strokeWidth="2" />
            {/* Top rim */}
            <line x1="11" y1="6" x2="29" y2="6" {...common} strokeWidth="2" />
            {/* Liquid fill */}
            <path d="M10 26 Q20 24 30 26 L30 34 L10 34 Z" fill={color} stroke="none" opacity="0.4" />
            {/* Bubbles */}
            <circle cx="16" cy="30" r="1.5" fill={color} stroke="none" opacity="0.7" />
            <circle cx="22" cy="28" r="1" fill={color} stroke="none" opacity="0.7" />
          </>
        );

      case 'molecule':
        return (
          <>
            {/* Central atom */}
            <circle cx="20" cy="20" r="4" fill={color} opacity="0.8" stroke={color} strokeWidth="1" />
            {/* Four surrounding atoms */}
            <circle cx="8" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="32" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="8" cy="28" r="3" fill="none" stroke={color} strokeWidth="1.5" />
            <circle cx="32" cy="28" r="3" fill="none" stroke={color} strokeWidth="1.5" />
            {/* Bonds */}
            <line x1="11" y1="15" x2="16" y2="18" {...common} strokeWidth="1.5" />
            <line x1="29" y1="15" x2="24" y2="18" {...common} strokeWidth="1.5" />
            <line x1="11" y1="25" x2="16" y2="22" {...common} strokeWidth="1.5" />
            <line x1="29" y1="25" x2="24" y2="22" {...common} strokeWidth="1.5" />
          </>
        );

      case 'periodic':
        return (
          <>
            {/* Periodic table tile grid */}
            <rect x="4" y="4" width="10" height="10" rx="1" {...common} strokeWidth="1.5" />
            <rect x="16" y="4" width="10" height="10" rx="1" {...common} strokeWidth="1.5" />
            <rect x="28" y="4" width="8" height="10" rx="1" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
            <rect x="4" y="16" width="10" height="10" rx="1" {...common} strokeWidth="1.5" />
            <rect x="16" y="16" width="10" height="10" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
            <rect x="28" y="16" width="8" height="10" rx="1" {...common} strokeWidth="1.5" />
            <rect x="4" y="28" width="10" height="8" rx="1" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
            <rect x="16" y="28" width="10" height="8" rx="1" {...common} strokeWidth="1.5" />
            <rect x="28" y="28" width="8" height="8" rx="1" {...common} strokeWidth="1.5" />
          </>
        );

      case 'flask':
        return (
          <>
            {/* Erlenmeyer flask shape */}
            <path d="M15 4 L15 16 L6 32 Q5 36 9 36 L31 36 Q35 36 34 32 L25 16 L25 4 Z"
              {...common} strokeWidth="2" />
            {/* Opening */}
            <line x1="13" y1="4" x2="27" y2="4" {...common} strokeWidth="2.5" />
            {/* Liquid */}
            <path d="M9 28 Q20 26 31 28 L31 36 Q20 37 9 36 Z"
              fill={color} stroke="none" opacity="0.35" />
            {/* Bubbles */}
            <circle cx="15" cy="31" r="1.5" fill={color} stroke="none" opacity="0.6" />
            <circle cx="21" cy="29" r="1" fill={color} stroke="none" opacity="0.6" />
            <circle cx="26" cy="32" r="1.2" fill={color} stroke="none" opacity="0.6" />
          </>
        );

      case 'bubble':
        return (
          <>
            {/* Main bubble */}
            <circle cx="20" cy="22" r="13" {...common} strokeWidth="2" opacity="0.9" />
            {/* Shine highlight */}
            <circle cx="14" cy="15" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
            {/* Smaller satellite bubbles */}
            <circle cx="8" cy="10" r="4" {...common} strokeWidth="1.5" opacity="0.7" />
            <circle cx="30" cy="8" r="3" {...common} strokeWidth="1.5" opacity="0.6" />
            <circle cx="33" cy="16" r="2" {...common} strokeWidth="1.5" opacity="0.5" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      {renderIcon()}
    </svg>
  );
};

export default ChemIcon;
