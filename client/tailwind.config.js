/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E53935',
        dark: '#111827',
        secondary: '#6B7280',
        border: '#E5E7EB',
        background: '#F9FAFB',
      },
    },
  },
  plugins: [],
}
