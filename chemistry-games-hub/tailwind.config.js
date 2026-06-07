/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chemistry: {
          pink: '#ff6eb4',
          mauve: '#c084fc',
          blue: '#7dd3fc',
          purple: '#a78bfa',
          mint: '#6ee7b7',
          yellow: '#fde68a',
          coral: '#fca5a5',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bubble': 'bubble 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(192, 132, 252, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(192, 132, 252, 0.8)' },
        },
        bubble: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '50%': { transform: 'translateY(-30px) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
        }
      },
    },
  },
  plugins: [],
}
