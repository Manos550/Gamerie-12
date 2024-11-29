/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aaf8',
          500: '#0c8ee7',
          600: '#0070c4',
          700: '#0059a0',
          800: '#004b84',
          900: '#003f6e',
          950: '#002847',
        },
        gaming: {
          neon: '#00ff9d',
          dark: '#0a0b0f',
          card: '#13141c',
          accent: '#ff3864',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 'text-shadow': '0 0 10px #00ff9d' },
          '100%': { 'text-shadow': '0 0 20px #00ff9d, 0 0 30px #00ff9d' },
        },
      },
    },
  },
  plugins: [],
};