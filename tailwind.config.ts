import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      spacing: {
        "brand-mobile": "2rem",
        "brand-desktop": "4rem",
      },
      fontFamily: {
        knewave: ["Knewave", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
