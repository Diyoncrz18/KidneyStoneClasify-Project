import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2463eb",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
        "surface-dark": "#1e293b", // sama nilainya dengan card-dark, tetap dipertahankan
        "border-light": "#e5e7eb",
        "border-dark": "#334155",
        "text-light": "#1e293b",
        "text-dark": "#f9fafb",
        "text-main": "#f9fafb",
        "text-secondary": "#92a4c8",
        "text-muted-light": "#6b7280",
        "text-muted-dark": "#94a3b8",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
