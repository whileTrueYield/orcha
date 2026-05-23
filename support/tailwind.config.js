const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "verdana",
          "Dejavu Sans",
          "arial",
          ...defaultTheme.fontFamily.sans,
        ],
        title: [
          "roboto",
          "arial",
          "sans-serif",
          ...defaultTheme.fontFamily.sans,
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
