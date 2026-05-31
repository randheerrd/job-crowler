/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Attio amber accent
        primary: {
          50:  '#fdf7ed',
          100: '#faecd5',
          200: '#f4d5a3',
          300: '#e8bb6a',
          400: '#dda040',
          500: '#c8894a',
          600: '#b07540',
          700: '#8f5e32',
          800: '#6e4826',
          900: '#4d321a',
          950: '#2a1b0d',
        },
        // Attio warm dark — inverted scale (50=darkest/page-bg, 900=lightest/text)
        gray: {
          50:  '#0f0e0d',  // page background
          100: '#141210',  // sidebar
          200: '#1c1a17',  // card / panel surface
          300: '#2e2b27',  // borders
          400: '#3d3a35',  // emphasis borders
          500: '#55504a',  // muted / placeholder text
          600: '#857f78',  // secondary text
          700: '#a8a099',  // body text
          800: '#c4bcb2',  // subheadings
          900: '#e8e3dc',  // primary text (warm off-white)
        },
        white: '#1c1a17',  // bg-white = elevated card surface
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'menu': '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'card': '0 0 0 1px rgba(255,255,255,0.04)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease',
      },
    },
  },
  plugins: [],
};
