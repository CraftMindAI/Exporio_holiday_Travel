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
        navyBlue: '#0c1b54', // Exporio Deep Blue
        navyDark: '#070f30',
        navyLight: '#1a3399',
        primaryCyan: '#ff4e00', // Changed to Exporio Sunset Orange
        secondaryCyan: '#e63e00',
        accentGold: '#FFC107',
        accentOrange: '#ff2a00',
        steelGray: '#4A5568',
        lightBg: '#F8FAFC',
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
