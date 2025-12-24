/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F4EB',
      },
      boxShadow: {
        'soft': '4px 4px 0px 0px #E0E5D5', 
      }
    },
  },
  plugins: [],
}