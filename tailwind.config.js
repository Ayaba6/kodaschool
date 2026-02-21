/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // On pourra dynamiser ces couleurs plus tard selon l'école
        primary: "#3b82f6", 
      },
    },
  },
  plugins: [],
}

