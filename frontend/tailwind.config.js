/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        banking: {
          950: '#0B0F19', // Darkest deep navy-black for background
          900: '#0F172A', // Slate-900 background
          800: '#1E293B', // Slate-800 card surface
          700: '#334155', // Slate-700 borders
          600: '#475569',
          primary: '#3B82F6', // Blue primary
          secondary: '#6366F1', // Indigo accents
          credit: '#10B981', // Emerald credit green
          debit: '#EF4444' // Red debit
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
