/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        muted: "#6b7280",
        card: "#ffffff",
        border: "#e5e7eb",
        accent: "#0284c7",
        accentSoft: "#e0f2fe"
      },
      boxShadow: {
        card: "0 10px 25px rgba(2,132,199,0.12)",
        soft: "0 4px 12px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl: "20px"
      }
    }
  },
  plugins: []
};
