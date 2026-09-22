import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#08090C",
        "bg-mid": "#101217",
        "bg-surface": "#181C23",
        "text-primary": "#F2F0EA",
        "text-secondary": "#A7ADB8",
        "text-muted": "#6F7785",
        "text-meta": "#7A9BB8",
        accent: "#4F7CFF",
        "accent-cobalt": "#243B80",
        "accent-cyan": "#65D6E8",
        "accent-violet": "#7867D8",
        "accent-indigo": "#34306B",
        "accent-champagne": "#D8B77A",
        "accent-amber": "#C58B52",
        "accent-rose": "#A45B8A",
        hairline: "rgba(242,240,234,0.08)",
        "hairline-lg": "rgba(242,240,234,0.14)",
      },
      fontFamily: {
        display: ["var(--font-display)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Consolas", "monospace"],
      },
      maxWidth: {
        maxw: "1320px",
      },
    },
  },
  plugins: [],
};

export default config;
