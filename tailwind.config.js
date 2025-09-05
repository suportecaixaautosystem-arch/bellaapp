// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          ...defaultTheme.colors.gray,
          850: '#182133',
          900: '#111827',
          950: '#0d131e',
        }
      }
    }
  },
  plugins: [],
};
