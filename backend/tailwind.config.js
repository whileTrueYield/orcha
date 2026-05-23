/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/**/*.html"],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: {
              fontSize: "1.6em",
              scrollMarginTop: "3.3em",
            },
            h2: {
              fontSize: "1.4em",
              scrollMarginTop: "3.5em",
            },
            h3: {
              fontSize: "1.2em",
              scrollMarginTop: "4em",
            },
            h4: {
              fontSize: "1em",
              scrollMarginTop: "5em",
              fontWeight: 500,
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
