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
        navyBlue: '#122a7f',
        navyDark: '#0e1f5d',
        navyLight: '#1d3cae',
        primaryCyan: '#122a7f', // changing primaryCyan usage to etripto blue for consistency, or keeping cyan for buttons? The search button in etripto is also blue. Let's make primaryCyan the vibrant etripto search blue.
        secondaryCyan: '#153291',
        accentGold: '#FFC107',
        accentOrange: '#FF6B6B',
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
        glow: '0 0 25px rgba(0, 242, 254, 0.4)',
      },
    },
  },
  plugins: [],
}
