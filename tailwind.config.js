/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#061225",
        panel: "#0b1b34",
        panel2: "#102747",
        line: "#274569",
        ink: "#f2f7ff",
        muted: "#9bb1cf",
        cyan: "#2f67b2",
        green: "#31c995",
        yellow: "#f3bd4e",
        red: "#ef6363"
      }
    }
  },
  plugins: []
};
