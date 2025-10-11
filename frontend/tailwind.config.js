/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#7B61FF',
        drakBg: "#0D0D0D",
        drakCard: "#1A1A1A",
        lightBg: "#F9FAFB",
        lightCard: "#FFFFFF",
        
      },
    },
  },
  plugins: [],
}

