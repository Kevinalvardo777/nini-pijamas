import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          50: "#fff1f3",
          100: "#ffe4ec",
          200: "#ffc7d5",
          300: "#ffa1b8",
          400: "#ff7a9a",
          500: "#f45f84",
          600: "#e84572",
          700: "#c53362",
          800: "#9f2a52",
          900: "#7d2344"
        },
        sand: "#fdf5f3",
        blush: "#fce6e9"
      }
    }
  },
  plugins: []
};

export default config;
