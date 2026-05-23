/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "3xl": "1792px",
        "4xl": "2048px",
      },
      keyframes: {
        tilt: {
          "0%, 50%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(1deg)",
          },
          "75%": {
            transform: "rotate(-1deg)",
          },
        },
        "device-rotate": {
          "0%": {
            transform: "rotate(0deg)",
            color: colors.red["400"],
          },
          "19%": {
            transform: "rotate(-90deg)",
            color: colors.red["400"],
          },
          "20%": {
            transform: "rotate(-90deg)",
            color: colors.green["400"],
          },
          "75%": {
            transform: "rotate(-90deg)",
            color: colors.green["400"],
          },
          "80%": {
            transform: "rotate(0deg)",
            color: colors.green["400"],
          },
          "81%": {
            transform: "rotate(0deg)",
            color: colors.red["400"],
          },
        },
      },
      maxHeight: {
        0: "0",
        16: "4rem",
        32: "8rem",
        64: "16rem",
        96: "24rem",
        128: "32rem",
      },
      height: {
        104: "26rem",
        112: "28rem",
        120: "30rem",
        128: "32rem",
      },
      width: {
        112: "28rem",
        128: "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
        "10xl": "104rem",
      },
      boxShadow: {
        tag: "inset 5px 0 7px -5px rgba(0,0,0,0.7)",
      },
      fontFamily: {
        sans: ["Inter Var", "inter", ...defaultTheme.fontFamily.sans],
        title: ["Inter Var", "inter", ...defaultTheme.fontFamily.sans],
        logo: ["Comfortaa", "inter", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        "2px": "2px",
        72: "18rem",
        84: "21rem",
        96: "24rem",
      },
      animation: {
        appear: "appear 200ms ease-out 1",
        "pulse-once": "strong-pulse 4s ease-out 1",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "transient-color": "transient-color 30s linear infinite",
        grow: "grow 200ms ease-out 1",
        hang: "hang 500ms ease-out forwards",
        tilt: "tilt 5s infinite linear",
        "device-rotate": "device-rotate 5s infinite linear",
      },
      colors: {
        gray: colors.slate,
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        brand: {
          DEFAULT: "#48ADF4",
          50: "#F5FBFE",
          100: "#E2F2FD",
          200: "#BCE1FB",
          300: "#95D0F9",
          400: "#6EBEF7",
          500: "#48ADF4",
          600: "#1395F1",
          700: "#0B76C1",
          800: "#08558C",
          900: "#053557",
        },
      },
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
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
