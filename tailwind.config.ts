import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          black: '#000000',
          border: '#222222',
          gold: '#E6C149',
          ice: '#A2D2FF',
        },
        gold: '#E6C149',
        'gold-light': '#ffd700',
        'ice-blue': '#a2d2ff',
      },
      boxShadow: {
        gold: '0 8px 24px rgba(230,193,73,0.25)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E6C149, #A2D2FF)',
        'gold-hero': 'linear-gradient(135deg, #e6c149 0%, #ffd700 50%, #a2d2ff 100%)',
        'gold-aurora': 'radial-gradient(1200px 600px at 20% 80%, rgba(230,193,73,0.18), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(162,210,255,0.12), transparent 60%)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fade-in 0.3s ease',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(50px, 50px) scale(1.05)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  safelist: [
    'bg-gradient-to-r',
    'from-[#e6c149]',
    'via-[#ffd700]',
    'to-[#a2d2ff]',
    'bg-clip-text',
    'text-transparent',
    'animate-blob',
    'animate-fade-in',
  ],
  plugins: [],
} satisfies Config