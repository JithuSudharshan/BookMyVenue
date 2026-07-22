/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-red': '#b80016',
        'admin-red-dark': '#970012',
        'admin-red-soft': '#fff1f2',
        'ink': '#27272a',
        'muted': '#71717a',
        'line': '#f0d9d9',
        'panel': '#fffafa',
        'surface': '#ffffff',
        'bg': '#f7f4f2',
        'green': '#16a34a',
        'amber': '#d97706',
        'blue': '#2563eb',
      },
      boxShadow: {
        'admin': '0 18px 45px rgba(113, 63, 63, 0.1)',
        'modal': '0 24px 60px rgba(39, 39, 42, 0.24)',
        'doc-modal': '0 20px 60px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
