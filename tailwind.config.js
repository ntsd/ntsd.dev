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
  },
  variants: {},
  plugins: [],
  darkMode: 'class',
};
