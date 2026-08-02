/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hpBg: '#111111',
        hpCard: '#1a1a1a',
        hpBorder: '#2a2a2a',
        hpText: '#dddddd',
        hpMuted: '#888888',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        'hp': '6px',
      }
    },
  },
  plugins: [],
}
