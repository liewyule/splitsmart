/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        muted: "#64748b",
        card: "#ffffff",
        border: "#e2e8f0",
        accent: "#0284c7",
        accentSoft: "#e0f2fe"
      },
      boxShadow: {
        card: "0 8px 20px rgba(15,23,42,0.08)",
        soft: "0 6px 16px rgba(15,23,42,0.06)"
      },
      borderRadius: {
        xl: "20px"
      }
    }
  },
  plugins: []
};
