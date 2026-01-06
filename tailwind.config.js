/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00FF88',
        'dark-green': '#00CC66',
        'light-green': '#88FFD0',
        'emerald': {
          300: '#88FFD0',
          400: '#00FF88',
          500: '#00CC66',
          600: '#00AA55',
        },
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'green-glow-lg': '0 0 40px rgba(0, 255, 136, 0.5)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

