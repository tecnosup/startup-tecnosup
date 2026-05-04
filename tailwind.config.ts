import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cyan: { DEFAULT: "#0eb3ff", dark: "#0a8fcc" },
        purple: { DEFAULT: "#7000ff", dark: "#5500cc" },
        bg: { DEFAULT: "#030407", card: "#0b1121", muted: "#0e1520" },
      },
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(14,179,255,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(14,179,255,0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
