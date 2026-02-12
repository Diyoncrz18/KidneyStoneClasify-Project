import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0ea5e9",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          DEFAULT: "#6366f1",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
        "surface-dark": "#1e293b",
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
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
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
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-delayed": "float 3s ease-in-out 1.5s infinite",
        "pulse-ring": "pulse-ring 2s infinite",
        "fade-in-up": "fadeInUp 0.6s ease both",
        "fade-in-up-1": "fadeInUp 0.6s 0.1s ease both",
        "fade-in-up-2": "fadeInUp 0.6s 0.2s ease both",
        "fade-in-up-3": "fadeInUp 0.6s 0.3s ease both",
        "fade-in-up-4": "fadeInUp 0.6s 0.4s ease both",
        "fade-in": "fadeIn 1s 0.3s ease both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0.3)" },
          "70%": { boxShadow: "0 0 0 15px rgba(14, 165, 233, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
