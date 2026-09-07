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
        background: "var(--background)",
        foreground: "var(--foreground)",
        forest: {
          50: '#f0f6f2',
          100: '#dcece1',
          200: '#b9d9c3',
          300: '#8ec09f',
          400: '#60a279',
          500: '#3f8559',
          600: '#2f6a45',
          700: '#275539',
          800: '#1b4332',
          900: '#133623',
          950: '#0c2417',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ede6',
          200: '#cedecf',
          300: '#abc5ad',
          400: '#81a882',
          500: '#618d63',
          600: '#4b704c',
          700: '#3d593e',
          800: '#334734',
          900: '#2b3b2c',
        },
        sand: {
          50: '#fbfaf8',
          100: '#f5f3ee',
          200: '#ece7de',
          300: '#ddd4c3',
        },
        nature: {
          bg: '#F4F7F4',
          card: '#FFFFFF',
          text: '#1A2E22',
          subtext: '#40514E',
          accent: '#81A882',
          dark: '#0C2417',
          pine: '#133623',
        }
      },
    },
  },
  plugins: [],
};
export default config;
