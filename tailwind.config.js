module.exports = {
  content: ["_site/**/*.html"],
  safelist: ["-translate-y-full", "max-h-screen"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            a: {
              "line-break": "anywhere",
            },
            code: {
              color: "#ccc!important",
              background: "#2d2d2d!important",
              padding: "0.1em",
              "border-radius": "0.3em",
              "white-space": "normal",
              "&::before": {
                display: "none",
              },
              "&::after": {
                display: "none",
              },
            },
          },
        },
      },
    },
    screens: {
      lg: { min: "1024px" },
    },
    container: {
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};
