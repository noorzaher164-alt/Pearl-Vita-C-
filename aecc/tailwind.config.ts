import type { Config } from 'tailwindcss';

/**
 * AECC — Al Eman Chemistry Club
 * Every value here comes from the AECC Master Brand & Website Guide (2026–2027).
 * No framework default palette is exposed: the stock Tailwind colours are replaced
 * entirely so no blue/slate/indigo can leak into a component.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    // Replacing (not extending) `colors` guarantees the acceptance-checklist rule
    // "no default framework blue remains".
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#FFFFFF',
      black: '#241019',

      plum: {
        DEFAULT: '#48132F',
        dark: '#3C0824',
        // tints derived only from the approved plum, for washes and hovers
        50: '#F6EAEF',
        100: '#EBD3DE',
        200: '#D2A7BC',
        300: '#B27B98',
        400: '#8B4E71',
        500: '#48132F',
        600: '#3C0824',
        700: '#2F061C',
      },
      rose: {
        DEFAULT: '#9F656B',
        soft: '#D7A7A5',
        gold: '#CB8C78',
        50: '#FBF1F0',
        100: '#F4E1DF',
        200: '#E7C6C4',
        300: '#D7A7A5',
        400: '#BE868A',
        500: '#9F656B',
        600: '#845158',
      },
      berry: '#764E61',
      mauve: {
        DEFAULT: '#AF949E',
        light: '#CBB8BF',
        dark: '#8C7280',
      },
      ivory: {
        DEFAULT: '#FBEAE6',
        deep: '#F6DED9',
      },
      blush: {
        DEFAULT: '#FDF5EF',
        deep: '#FAEDE5',
      },
      ink: {
        DEFAULT: '#2D1A1E',
        muted: '#5E4650',
        faint: '#8A6B70',
      },
      line: {
        DEFAULT: 'rgba(72,19,47,0.12)',
        strong: 'rgba(72,19,47,0.22)',
        gold: 'rgba(203,140,120,0.45)',
      },

      // Muted semantic set — used only where meaning demands it.
      success: { DEFAULT: '#4F6B57', soft: '#E7EFE8', ink: '#33463A' },
      warning: { DEFAULT: '#B58551', soft: '#FBEFE0', ink: '#7A5730' },
      danger: { DEFAULT: '#9B4A4A', soft: '#F8E6E4', ink: '#6B2F2F' },
      info: { DEFAULT: '#6E5A72', soft: '#F1EBF0', ink: '#4A3B4E' },
    },

    fontFamily: {
      display: ['var(--font-display)', 'Bodoni Moda', 'Georgia', 'serif'],
      sans: ['var(--font-ui)', 'Manrope', 'Arial', 'system-ui', 'sans-serif'],
      'display-ar': ['var(--font-display-ar)', 'Noto Naskh Arabic', 'serif'],
      'sans-ar': ['var(--font-ui-ar)', 'Tajawal', 'Arial', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },

    // Guide §3 type scale, expressed as size/line-height pairs.
    fontSize: {
      caption: ['0.75rem', { lineHeight: '1.125rem' }],
      small: ['0.875rem', { lineHeight: '1.375rem' }],
      body: ['1rem', { lineHeight: '1.625rem' }],
      h3: ['1.375rem', { lineHeight: '1.875rem' }],
      h2: ['1.75rem', { lineHeight: '2.25rem' }],
      h1: ['2.25rem', { lineHeight: '2.75rem' }],
      'hero-sm': ['2.25rem', { lineHeight: '2.75rem' }],
      hero: ['3rem', { lineHeight: '3.5rem' }],
      metric: ['2rem', { lineHeight: '2.375rem' }],
    },

    // Guide §4: 4/8/12/16/24/32/48/64 — no arbitrary spacing.
    spacing: {
      0: '0px',
      px: '1px',
      0.5: '2px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      32: '128px',
      64: '256px',
      66: '264px',
    },

    borderRadius: {
      none: '0',
      control: '12px',
      card: '18px',
      lg: '18px',
      xl: '24px',
      pill: '999px',
      full: '999px',
    },

    boxShadow: {
      card: '0 10px 35px rgba(75,22,50,.08)',
      soft: '0 4px 16px rgba(75,22,50,.06)',
      lift: '0 18px 48px rgba(75,22,50,.12)',
      focus: '0 0 0 3px rgba(159,101,107,.35)',
      none: 'none',
    },

    extend: {
      maxWidth: {
        shell: '1280px',
        prose: '68ch',
      },
      transitionDuration: {
        DEFAULT: '180ms',
        fast: '150ms',
        slow: '220ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(.32,.72,.32,1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'sheen': {
          '0%,100%': { opacity: '0.35' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fade-up 220ms cubic-bezier(.32,.72,.32,1) both',
        'fade-in': 'fade-in 180ms ease-out both',
        sheen: 'sheen 6s ease-in-out infinite',
      },
      backgroundImage: {
        'plum-veil': 'linear-gradient(135deg, #48132F 0%, #3C0824 58%, #5A2440 100%)',
        'ivory-veil': 'linear-gradient(180deg, #FBEAE6 0%, #FDF5EF 100%)',
        'gold-rule': 'linear-gradient(90deg, transparent, rgba(203,140,120,.65), transparent)',
      },
    },
  },
  plugins: [],
};

export default config;
