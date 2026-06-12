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
        pitch: "#0B6B3A",
        paper: "#F7F5EF",
        alert: "#D72638",
        ink: "#101820",
        trophy: "#D9A441"
      },
      fontFamily: {
        sanscn: ["var(--font-noto-sans-sc)", '"PingFang SC"', '"Microsoft YaHei"', "sans-serif"],
        display: ["var(--font-barlow-condensed)", "var(--font-noto-sans-sc)", "sans-serif"],
        serifcn: ['"Noto Serif SC"', '"Songti SC"', "serif"]
      },
      boxShadow: {
        score: "0 14px 44px rgba(16, 24, 32, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
