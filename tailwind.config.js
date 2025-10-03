import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Indian Government Official Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1a365d", // Official Navy Blue
          foreground: "#ffffff",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1",
          700: "#1a365d",
          800: "#1e3a8a",
          900: "#1e40af"
        },
        secondary: {
          DEFAULT: "#6b7280", // Professional Gray
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc2626", // Clear Red for alerts
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b", // Clear Orange for warnings
          foreground: "#000000",
        },
        success: {
          DEFAULT: "#059669", // Professional Green
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#1f2937",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1f2937",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1f2937",
        },
        // Indian Tricolor inspired professional colors
        saffron: {
          DEFAULT: "#ff9933",
          light: "#ffb366",
          dark: "#cc7a29"
        },
        white: {
          DEFAULT: "#ffffff",
          dark: "#f8fafc"
        },
        green: {
          DEFAULT: "#138808",
          light: "#16a34a",
          dark: "#0f5132"
        },
        navy: {
          DEFAULT: "#000080",
          light: "#1e40af",
          dark: "#1e3a8a"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [forms],
}

