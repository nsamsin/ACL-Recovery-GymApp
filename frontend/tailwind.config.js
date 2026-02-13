/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a2744",
        accent: "#3b82f6",
        warmup: "#f59e0b",
        bloka: "#2563eb",
        blokb: "#1f2937",
        blokc: "#0f766e",
        cooldown: "#4f46e5",
        "surface-secondary": "#f2f2f7",
        "surface-tertiary": "#e5e5ea",
        "ios-red": "#ff3b30",
        "ios-green": "#34c759",
        "ios-orange": "#ff9500",
        "ios-blue": "#007aff"
      },
      boxShadow: {
        "ios-sm": "0 1px 3px rgba(0,0,0,0.08)",
        ios: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "ios-lg": "0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.04)",
        "ios-xl": "0 8px 30px rgba(0,0,0,0.12)",
        "ios-nav": "0 -1px 12px rgba(0,0,0,0.06)"
      },
      borderRadius: {
        ios: "12px",
        "ios-lg": "16px"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s cubic-bezier(0.25,0.1,0.25,1)",
        "slide-up": "slide-up 0.35s cubic-bezier(0.25,0.1,0.25,1) both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.25,0.1,0.25,1) both"
      },
      transitionTimingFunction: {
        ios: "cubic-bezier(0.25, 0.1, 0.25, 1)"
      }
    }
  },
  plugins: []
};
