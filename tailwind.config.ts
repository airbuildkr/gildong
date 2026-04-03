import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        profit: "#16A34A",
        loss: "#DC2626",
      },
      maxWidth: {
        content: "640px",
      },
      lineHeight: {
        relaxed: "1.8",
      },
    },
  },
  plugins: [],
};
export default config;
