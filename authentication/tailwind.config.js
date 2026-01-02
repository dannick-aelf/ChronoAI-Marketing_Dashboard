/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Grey theme with strict legibility
        grey: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        // Text colors for maximum legibility (WCAG AA+)
        text: {
          primary: '#171717',
          secondary: '#404040',
          muted: '#737373',
          inverse: '#FAFAFA',
        },
        // Background colors
        bg: {
          primary: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
          dark: '#171717',
          'dark-secondary': '#262626',
        },
        // Border colors
        border: {
          light: '#E5E5E5',
          DEFAULT: '#D4D4D4',
          dark: '#A3A3A3',
        },
      },
      spacing: {
        'mobile': '20px',
      },
      borderRadius: {
        'button': '10px',
        'card': '12px',
        'input': '10px',
        'modal': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

