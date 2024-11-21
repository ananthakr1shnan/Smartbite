/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#4F46E5',
            light: '#818CF8',
            dark: '#3730A3',
          },
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-out forwards',
          'slide-in': 'slideIn 0.3s ease-out forwards',
          'pulse': 'pulse 2s infinite',
        },
      },
    },
    plugins: [],
  }