module.exports = {
  purge: {
    enabled: true,
    content: ['_site/**/*.html'],
  },
  theme: {
    extend: {},
    screens: {
      'md': {'max': '1023px'},
      'lg': {'min': '1024px'},
    },
    container: {
      screens: {
         sm: "100%",
         lg: "1024px",
         xl: "1280px"
      },
    },
  },
  variants: {},
  plugins: [],
  darkMode: 'class',
};
