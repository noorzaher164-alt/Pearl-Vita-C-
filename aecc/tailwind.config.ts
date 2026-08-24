import type { Config } from 'tailwindcss';

/**
 * AECC — Al Eman Chemistry Club
 * Colours reference CSS custom properties so dark mode works automatically.
 * The --c-* variables are space-separated RGB channels; the <alpha-value>
 * placeholder lets Tailwind opacity modifiers (bg-plum/50) still work.
 *
 * `white` and `black` stay literal so sidebar overlays (bg-white/10 on the
 * dark plum sidebar) never change.
 */

function cv(name: string) {
  return `rgb(var(--c-${name}) / <alpha-value>)`;
}

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#FFFFFF',
      black: '#241019',

      plum: {
        DEFAULT: cv('plum'),
        dark: cv('plum-dark'),
        accent: cv('plum-accent'),
        50: cv('plum-50'),
        100: cv('plum-100'),
        200: cv('plum-200'),
        300: cv('plum-300'),
        400: cv('plum-400'),
        500: cv('plum-500'),
        600: cv('plum-600'),
        700: cv('plum-700'),
      },
      rose: {
        DEFAULT: cv('rose'),
        soft: cv('rose-soft'),
        gold: cv('rose-gold'),
        50: cv('rose-50'),
        100: cv('rose-100'),
        200: cv('rose-200'),
        300: cv('rose-300'),
        400: cv('rose-400'),
        500: cv('rose-500'),
        600: cv('rose-600'),
      },
      berry: cv('berry'),
      mauve: {
        DEFAULT: cv('mauve'),
        light: cv('mauve-light'),
        dark: cv('mauve-dark'),
      },
      ivory: {
        DEFAULT: cv('ivory'),
        deep: cv('ivory-deep'),
      },
      blush: {
        DEFAULT: cv('blush'),
        deep: cv('blush-deep'),
      },
      surface: cv('surface'),
      ink: {
        DEFAULT: cv('ink'),
        muted: cv('ink-muted'),
        faint: cv('ink-faint'),
      },
      line: {
        DEFAULT: 'var(--c-line)',
        strong: 'var(--c-line-strong)',
        gold: 'var(--c-line-gold)',
      },

      success: { DEFAULT: cv('success'), soft: cv('success-soft'), ink: cv('success-ink') },
      warning: { DEFAULT: cv('warning'), soft: cv('warning-soft'), ink: cv('warning-ink') },
      danger: { DEFAULT: cv('danger'), soft: cv('danger-soft'), ink: cv('danger-ink') },
      info: { DEFAULT: cv('info'), soft: cv('info-soft'), ink: cv('info-ink') },
    },

    fontFamily: {
      display: ['var(--font-display)', 'Bodoni Moda', 'Georgia', 'serif'],
      sans: ['var(--font-ui)', 'Manrope', 'Arial', 'system-ui', 'sans-serif'],
      'display-ar': ['var(--font-display-ar)', 'Noto Naskh Arabic', 'serif'],
      'sans-ar': ['var(--font-ui-ar)', 'Tajawal', 'Arial', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },

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
        sheen: {
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
