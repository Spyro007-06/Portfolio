import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0C",
        graphite: "#141518",
        bone: "#EDEAE3",
        dim: "#8E8C87",
        faint: "#7C7A75",
        line: "rgba(237,234,227,0.1)",
        blue: "#3D6BFF",
        acid: "#C6F432",
        orange: "#FF6A2B",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
