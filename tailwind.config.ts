import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./world/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0B",
        graphite: "#111113",
        panel: "#17171A",
        bone: "#FBF8F1", // high-contrast warm ivory
        dim: "#BDB5A8", // enhanced contrast (was #968F83)
        faint: "#9C9588", // enhanced metadata contrast (was #7F796E)
        line: "rgba(241,234,219,0.14)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        cyan: "#3EE6D8",
        orange: "#FF7A2E",
        magenta: "#D8508F",
        acid: "#C8F04A",
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
