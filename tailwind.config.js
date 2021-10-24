module.exports = {
  purge: {
    enabled: true,
    content: ['_site/**/*.html'],
  },
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            a: {
              'line-break': 'anywhere',
            },
          },
        },
      },
    },
    screens: {
      'md': { 'max': '1023px' },
      'lg': { 'min': '1024px' },
    },
    container: {
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px"
      },
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};
