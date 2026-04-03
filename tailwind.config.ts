import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        sand: "#f7f1e8",
        coral: "#ea5a47",
        gold: "#f0b429",
        pine: "#165b47"
      },
      boxShadow: {
        card: "0 18px 60px rgba(22, 36, 58, 0.14)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Avenir Next", "Segoe UI", "sans-serif"],
        body: ["var(--font-body)", "Avenir Next", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
