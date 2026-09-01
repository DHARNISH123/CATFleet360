/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: '#ffcd00',
          yellowHover: '#e6b800',
          yellowLight: '#fff8db',
          charcoal: '#231f20',
          charcoalLight: '#2f3131',
          black: '#141414',
          dark: '#1a1c1c',
          panel: '#202222',
          surface: '#f9f9f9',
          surfaceDim: '#dadada',
          border: '#e2e2e2',
          borderDark: '#393c3d',
          textMuted: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
