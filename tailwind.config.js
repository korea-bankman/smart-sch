/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070b12",
        panel: "#0d1421",
        panel2: "#111b2b",
        line: "#243247",
        ink: "#e7eef8",
        muted: "#8fa2ba",
        cyan: "#28d3ff",
        green: "#35d07f",
        yellow: "#f6c851",
        red: "#ff5b5b"
      }
    }
  },
  plugins: []
};
