import React from 'react';

const BUBBLE_COLORS = [
  'rgba(192, 132, 252, 0.15)',
  'rgba(236, 72, 153, 0.12)',
  'rgba(96, 165, 250, 0.13)',
  'rgba(167, 139, 250, 0.14)',
  'rgba(244, 114, 182, 0.11)',
  'rgba(129, 140, 248, 0.15)',
];

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  color: string;
}

const bubbles: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: 20 + Math.floor(((i * 37 + 13) % 81)),
  left: (i * 6.5 + 2) % 96,
  duration: 8 + ((i * 3 + 7) % 13),
  delay: -((i * 2.3) % 15),
  color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
}));

const keyframesStyle = `
@keyframes bubbleFloat {
  0% {
    transform: translateY(100vh) scale(0.8);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-120px) scale(1.1);
    opacity: 0;
  }
}
`;

const BubbleBackground: React.FC = () => {
  return (
    <>
      <style>{keyframesStyle}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            style={{
              position: 'absolute',
              bottom: '-120px',
              left: `${bubble.left}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              borderRadius: '50%',
              background: bubble.color,
              border: `1px solid ${bubble.color.replace(/[\d.]+\)$/, '0.4)')}`,
              backdropFilter: 'blur(2px)',
              animation: `bubbleFloat ${bubble.duration}s linear ${bubble.delay}s infinite`,
              boxShadow: `0 0 ${Math.round(bubble.size / 2)}px ${bubble.color}`,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default BubbleBackground;
