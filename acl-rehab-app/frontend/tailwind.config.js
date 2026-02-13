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
        cooldown: "#4f46e5"
      }
    }
  },
  plugins: []
};
