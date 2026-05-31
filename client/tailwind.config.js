/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Render's purple — accent only, not backgrounds
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Inverted gray — pure black dark theme (Render-style)
        // gray-50 = darkest (page bg),  gray-900 = lightest (text)
        gray: {
          50:  '#0a0a0a',  // page background
          100: '#111111',  // sidebar / secondary surface
          200: '#161616',  // card surface
          300: '#262626',  // borders
          400: '#3a3a3a',  // subtle dividers
          500: '#555555',  // placeholder / disabled
          600: '#888888',  // secondary text
          700: '#aaaaaa',  // body text
          800: '#d4d4d4',  // subheadings
          900: '#f5f5f5',  // primary text
        },
        white: '#161616',   // elevated card surface
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 0 0 1px rgba(139,92,246,0.4)',
        'glow': '0 0 20px rgba(124,58,237,0.25)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease',
      },
    },
  },
  plugins: [],
};
