import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'DM Sans',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji'
        ],
        inter: ['Inter', 'ui-sans-serif', 'system-ui'], // added Inter
      },
      colors: {
        primary: {
          50: '#effaf5',
          100: '#d9f2e6',
          200: '#b6e5ce',
          300: '#88d5b1',
          400: '#5fcf9b',
          500: '#3CB179', // logo/theme primary
          600: '#30A46C', // button color
          700: '#2b8f62', // darker hover
          800: '#257a55',
          900: '#1f6649',
        },
        gaming: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      keyframes: {
        'slide-in-from-bottom': {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        'slide-in-from-bottom-4': 'slide-in-from-bottom 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [
    forms,
  ],
}
