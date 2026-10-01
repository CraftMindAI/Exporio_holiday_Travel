/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navyBlue: '#1a1a4e', // Exporio Deep Blue (from logo top)
        navyDark: '#0d0d2b', // Darkest navy (backgrounds)
        navyLight: '#2d2b6b', // Lighter navy accent
        primaryCyan: '#ff4e00', // Exporio Sunset Orange
        secondaryCyan: '#e63e00',
        accentGold: '#FFC107',
        accentOrange: '#ff2a00',
        steelGray: '#4A5568',
        lightBg: '#0d0d2b', // Dark background to match logo theme
        borderGray: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -15px rgba(2,12,27,0.1)',
        cardHover: '0 20px 40px -15px rgba(2,12,27,0.25)',
        glow: '0 0 25px rgba(255, 78, 0, 0.4)', // Updated to orange glow
      },
    },
  },
  plugins: [],
}
