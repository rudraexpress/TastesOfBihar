module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "tob-yellow": "#F6C24B",
        "tob-dark": "#7A4B0D",
      },
    },
  },
  plugins: [],
};
