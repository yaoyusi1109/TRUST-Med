import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002D72",
        accent: "#A6192E",
        background: "#FAFAF7",
        ink: "#1A1A1A",
        muted: "#5A5A5A",
        line: "#E5E0D5",
        paper: "#FFFFFF",
        wash: "#F4F1EA"
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-newsreader)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"]
      },
      maxWidth: {
        content: "1100px"
      },
      borderRadius: {
        card: "4px",
        button: "2px"
      }
    }
  },
  plugins: []
};

export default config;
