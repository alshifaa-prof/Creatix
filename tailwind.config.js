/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Primary Editorial Palette
        cream: '#F3EAE0',
        ink: {
          DEFAULT: '#171514',
          950: '#0F0E0D',
          900: '#171514',
          850: '#1E1B1A',
          800: '#282422',
          700: '#3D3835',
          600: '#5A534F',
          500: '#7B726C',
        },
        offwhite: '#FAF7F2',
        gold: {
          50: '#FBF8F3',
          100: '#F4ECE1',
          200: '#E9D9C3',
          300: '#DEC6A5',
          400: '#CDB188',
          500: '#B49A70', // Primary Champagne Gold
          600: '#9C8258',
          700: '#7A6440',
          800: '#59472A',
          900: '#3A2E19',
        },
        sand: {
          50: '#F9F6F2',
          100: '#F1ECE4',
          200: '#E6DED2',
          300: '#D4C2AE', // Primary Soft Sand
          400: '#C2AD96',
          500: '#A9927A',
          600: '#8A735E',
          700: '#695644',
          800: '#4A3B2E',
        },
        terracotta: {
          50: '#FAF3F1',
          100: '#F4E3DF',
          200: '#E7C2B9',
          300: '#D79F91',
          400: '#C47C6A',
          500: '#A85F48', // Primary Restrained Terracotta
          600: '#8F4E3A',
          700: '#723C2C',
          800: '#542A1D',
        },
        surface: {
          50: '#FAF7F2', // Warm Off-White
          100: '#F3EAE0', // Warm Ivory / Cream
          200: '#EAE1D6',
          300: '#D4C2AE', // Soft Sand
          400: '#B49A70', // Gold
          500: '#8C7A65',
          800: '#282422',
          900: '#171514', // Deep Ink Black
        },
        creator: {
          50: '#F2F8F5',
          100: '#E2F1E9',
          500: '#2D6A4F',
          700: '#1E4936',
          800: '#173628',
          900: '#171514', // Mapped to Deep Ink Black for unified luxury feel
          accent: '#B49A70', // Muted Champagne Gold
        },
        brand: {
          50: '#F3F5F8',
          100: '#E4E9F1',
          500: '#365373',
          700: '#223851',
          800: '#1B2A3D',
          900: '#171514', // Unified Deep Ink Black
          accent: '#B49A70', // Muted Champagne Gold
        },
      },
      boxShadow: {
        'luxury': '0 4px 20px -2px rgba(23, 21, 20, 0.05), 0 2px 6px -1px rgba(23, 21, 20, 0.03)',
        'luxury-lg': '0 12px 32px -4px rgba(23, 21, 20, 0.08), 0 4px 12px -2px rgba(23, 21, 20, 0.04)',
        'luxury-card': '0 1px 3px rgba(23, 21, 20, 0.04), 0 8px 24px -4px rgba(23, 21, 20, 0.06)',
      },
    },
  },
  plugins: [],
}
