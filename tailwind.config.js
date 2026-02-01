/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'ucla-blue': '#2774AE',
        'ucla-gold': '#FFD100',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
};