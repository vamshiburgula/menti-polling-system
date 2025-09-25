/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#7765DA',
          600: '#5767D0',
          700: '#4F0DCE',
        },
        neutral: {
          100: '#F2F2F2',
          600: '#6E6E6E',
          800: '#373737',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7765DA 0%, #5767D0 50%, #4F0DCE 100%)',
        'gradient-secondary': 'linear-gradient(45deg, #7765DA 0%, #4F0DCE 100%)',
      }
    },
  },
  plugins: [],
}
