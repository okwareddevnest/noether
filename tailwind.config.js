/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4a90e2',
          dark: '#357abd',
          light: '#6ba5e7',
        },
        secondary: {
          DEFAULT: '#2d2d2d',
          dark: '#1e1e1e',
          light: '#363636',
        },
        success: '#4ecdc4',
        warning: '#ffd93d',
        error: '#ff6b6b',
        background: {
          DEFAULT: '#1e1e1e',
          dark: '#141414',
          light: '#2d2d2d',
        }
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} 