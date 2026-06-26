/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          50:  'rgb(var(--eco-50)  / <alpha-value>)',
          100: 'rgb(var(--eco-100) / <alpha-value>)',
          200: 'rgb(var(--eco-200) / <alpha-value>)',
          300: 'rgb(var(--eco-300) / <alpha-value>)',
          400: 'rgb(var(--eco-400) / <alpha-value>)',
          500: 'rgb(var(--eco-500) / <alpha-value>)',
          600: 'rgb(var(--eco-600) / <alpha-value>)',
          700: 'rgb(var(--eco-700) / <alpha-value>)',
          800: 'rgb(var(--eco-800) / <alpha-value>)',
          900: 'rgb(var(--eco-900) / <alpha-value>)',
        }
      }
    }
  },
  plugins: []
}
