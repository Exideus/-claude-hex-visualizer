/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hex-bg': '#0a0a0f',
        'hex-grid': '#1a1a2e',
        'hex-active': '#00ff88',
        'hex-idle': '#3a3a5e',
        'hex-working': '#ffaa00',
        'hex-error': '#ff4444',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
