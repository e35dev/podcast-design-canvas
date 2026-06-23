import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16211f",
        muted: "#5e6b67",
        line: "#d9e0dd",
        panel: "#f7faf8",
        accent: "#136f63",
      },
    },
  },
  plugins: [],
};

export default config;
