/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ["var(--font-cinzel)", "Cinzel", "serif"],
        playfair: ["var(--font-playfair)", "Playfair Display", "serif"],
        montserrat: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        cormorant: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        serif: ["var(--font-serif)", "Cinzel", "serif"],
        sans: ["var(--font-sans)", "Poppins", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        cursive: ["var(--font-cursive)", "Great Vibes", "cursive"],
      },
    },
  },
  plugins: [],
}
