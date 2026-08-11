/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#4e0303ff',
        secondary: '#5a197dff',
        accent: '#07440fff',
        info: '#21416dff',
        purpleVibe: '#36165dff',
        pinkVibe: '#104559ff',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
