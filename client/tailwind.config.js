/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Render's violet-purple brand
        primary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Inverted gray scale — Render dark palette
        // gray-50 = darkest (page bg), gray-900 = lightest (text)
        gray: {
          50:  '#09071a',   // page background
          100: '#100d27',   // sidebar
          200: '#17132e',   // card surface
          300: '#2a2350',   // borders
          400: '#463d6e',   // muted borders
          500: '#6b5f9e',   // placeholder / muted
          600: '#9d91cc',   // secondary text
          700: '#c5bff0',   // body text
          800: '#ddd8fa',   // subheadings
          900: '#f0edff',   // primary text (lightest)
        },
        // white = elevated card surface
        white: '#1e1840',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px 0 rgba(147,51,234,0.15)',
        'glow':    '0 0 24px 0 rgba(147,51,234,0.20)',
        'glow-lg': '0 0 40px 0 rgba(147,51,234,0.25)',
        'card':    '0 1px 3px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
