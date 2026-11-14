/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          50: '#faf9f5', // Warm paper
          100: '#f4f2eb',
          200: '#e8e5db',
          300: '#d7d2c3',
          400: '#b8b19d',
          500: '#948c74',
          800: '#2c2a25',
          900: '#1b1a17',
        },
        creator: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          700: '#15803d',
          800: '#166534',
          900: '#1b4332', // Deep Forest Ink
          accent: '#c2410c', // Terracotta
        },
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#3b82f6',
          700: '#1d4ed8',
          800: '#1e293b',
          900: '#0f172a', // Midnight Slate
          accent: '#b45309', // Warm Bronze
        },
      },
    },
  },
  plugins: [],
}
