import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-ui)", "Lora", "Georgia", "serif"],
        sans: ["var(--font-ui)", "Lora", "Georgia", "serif"],
        // Keep labels, calendar data, controls, and headings on the same Lora family.
        mono: ["var(--font-ui)", "Lora", "Georgia", "serif"],
      },
      colors: {
        cream: "#FAF7F2",
        sand: "#E0D6C8",
        sage: {
          light: "#E8F0E9",
          DEFAULT: "#818E77",
          border: "#CEDECF",
          accent: "#81A882",
          dark: "#2D7A58",
        },
        forest: {
          DEFAULT: "#133623",
          deep: "#0C2417",
          emerald: "#1b4332",
        },
        charcoal: {
          DEFAULT: "#212121",
          muted: "#7E7970",
        },
        rust: "#B4654B",
      },
    },
  },
  plugins: [],
};
export default config;
