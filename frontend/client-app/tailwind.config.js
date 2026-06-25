/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        swiss: {
          white: "#FFFFFF",
          neutral: "#F7F7F8",
          accent: "#002FA7",
          text: "#111111",
          muted: "#6B6B6B",
          border: "#E0E0E0",
          red: "#E4002B",
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        "detail": ["0.6875rem", { lineHeight: "1rem" }],
      },
    },
  },
  plugins: [],
};
