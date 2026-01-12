import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      boxShadow: {
        card: "0 8px 20px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      colors: {
        ink: "#0f172a",
        cloud: "#f8fafc",
        mist: "#eef2f7",
      },
    },
  },
  plugins: [],
};

export default config;
