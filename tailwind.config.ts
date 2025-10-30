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
      },
      boxShadow: {
        gold: '0 8px 24px rgba(230,193,73,0.25)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #E6C149, #A2D2FF)',
        'gold-aurora': 'radial-gradient(1200px 600px at 20% 80%, rgba(230,193,73,0.18), transparent 60%), radial-gradient(1000px 500px at 80% 20%, rgba(162,210,255,0.12), transparent 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config