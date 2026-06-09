/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        'scan-line': {
          '0%, 100%': { top: '0' },
          '50%': { top: '100%' },
        },
      },
      animation: {
        shake: 'shake 0.5s',
        'scan-line': 'scan-line 2s infinite',
      },
    },
  },
  plugins: [],
}
