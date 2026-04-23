/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          cardHover: '#1a1a24',
          border: '#2a2a35'
        },
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#8b5cf6'
        },
        accent: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2'
        }
      },
      boxShadow: {
        glow: '0 0 15px rgba(124, 58, 237, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #7c3aed, 0 0 10px #7c3aed' },
          '100%': { boxShadow: '0 0 10px #7c3aed, 0 0 20px #06b6d4' },
        }
      }
    },
  },
  plugins: [],
}
