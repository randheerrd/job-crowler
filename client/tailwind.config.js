/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: warm amber-brown
        primary: {
          50:  '#fdf6ec',
          100: '#faebd0',
          200: '#f3d5a0',
          300: '#e9b96a',
          400: '#dd9a38',
          500: '#c47d14',
          600: '#a66410',
          700: '#88500d',
          800: '#6b3c0a',
          900: '#4e2b07',
        },
        // Override gray → warm sepia grays
        gray: {
          50:  '#fdf8f2',
          100: '#f5ede0',
          200: '#e8dbc8',
          300: '#d4c4a8',
          400: '#b8a285',
          500: '#9a7f62',
          600: '#7a6248',
          700: '#5c4833',
          800: '#3d2e20',
          900: '#2d1f0e',
        },
        // Override white → warm cream
        white: '#fdfaf5',
      },
      fontFamily: {
        sans:  ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        serif: ['EB Garamond', 'Georgia', 'serif'],
        mono:  ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
