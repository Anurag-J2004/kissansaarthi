/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B5D3B',
        secondary: '#16A34A',
        accent: '#00B8D9',
        background: '#F6FAF7',
        'dark-text': '#172033',
        warning: '#F59E0B',
        danger: '#DC2626',
      }
    },
  },
  plugins: [],
}
