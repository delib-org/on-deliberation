import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./chapters/**/*.{md,mdx}",
    "./data/**/*.{js,ts,json}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        accent: "var(--accent)",
        accentSoft: "var(--accent-soft)",
        line: "var(--line)"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(51, 36, 27, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

