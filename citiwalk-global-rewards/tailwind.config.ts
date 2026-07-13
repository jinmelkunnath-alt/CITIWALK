import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        brand: {
          50: "#f5f2ff",
          100: "#ede8ff",
          200: "#ddd3ff",
          300: "#c4adff",
          400: "#a779ff",
          500: "#8f46ff",
          600: "#7c2ef2",
          700: "#6820ce",
          800: "#571eaa",
          900: "#481b8a",
          950: "#2b0c60"
        },
        accent: {
          50: "#fff8eb",
          100: "#ffedc6",
          200: "#ffda88",
          300: "#ffc24a",
          400: "#ffa51f",
          500: "#f98607",
          600: "#dd6102",
          700: "#b74306",
          800: "#94330c",
          900: "#7a2c0d"
        }
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        display: ["clamp(2.8rem, 7vw, 6.75rem)", { lineHeight: "0.94", letterSpacing: "-0.065em", fontWeight: "700" }],
        "display-sm": ["clamp(2.25rem, 5vw, 4.75rem)", { lineHeight: "1", letterSpacing: "-0.05em", fontWeight: "700" }],
        eyebrow: ["0.7rem", { lineHeight: "1", letterSpacing: "0.18em", fontWeight: "700" }]
      },
      spacing: {
        section: "clamp(5.5rem, 10vw, 9rem)",
        gutter: "clamp(1.25rem, 4vw, 2.5rem)"
      },
      borderRadius: {
        panel: "1.75rem",
        card: "1.25rem",
        control: "0.875rem"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(3, 1, 12, 0.45)",
        "glow-purple": "0 0 0 1px rgba(167, 121, 255, 0.12), 0 18px 60px rgba(124, 46, 242, 0.22)",
        "glow-orange": "0 0 0 1px rgba(255, 165, 31, 0.12), 0 18px 60px rgba(249, 134, 7, 0.16)",
        control: "0 8px 28px rgba(5, 2, 15, 0.28)"
      },
      backdropBlur: {
        xs: "2px",
        glass: "24px"
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #a779ff 0%, #7c2ef2 48%, #571eaa 100%)",
        "accent-gradient": "linear-gradient(135deg, #ffc24a 0%, #f98607 100%)",
        "aurora": "radial-gradient(circle at 18% 12%, rgba(124,46,242,.22), transparent 38%), radial-gradient(circle at 82% 28%, rgba(249,134,7,.12), transparent 32%), radial-gradient(circle at 52% 78%, rgba(143,70,255,.14), transparent 40%)"
      },
      keyframes: {
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(2%,-2%,0) scale(1.05)" }
        },
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-14px,0)" }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" }
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" }
        },
        particle: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)", opacity: "0.15" },
          "50%": { transform: "translate3d(var(--particle-drift, 16px), -28px, 0)", opacity: "0.65" }
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        aurora: "aurora 14s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 5s ease-in-out infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        particle: "particle var(--particle-speed, 8s) ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
