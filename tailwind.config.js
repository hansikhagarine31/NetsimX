/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
          500: '#4B5563',
        },
        cyber: {
          blue: '#00F0FF',
          green: '#00FF66',
          purple: '#7000FF',
          yellow: '#FFB800',
          red: '#FF2E54'
        }
      }
    },
  },
  plugins: [],
}
