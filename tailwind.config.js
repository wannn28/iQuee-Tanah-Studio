/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4EFE6',
        bone: '#EAE1D1',
        sand: '#D9CCB6',
        ink: '#221E19',
        stone: '#6B6358',
        clay: { DEFAULT: '#A24E2C', dark: '#853D20', light: '#E8C9B5' },
        moss: '#56613F',
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans Variable"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { label: '0.16em' },
      maxWidth: { page: '84rem' },
    },
  },
  plugins: [],
}
