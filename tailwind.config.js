import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  safelist: ['-translate-y-full', 'max-h-screen'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            a: {
              'line-break': 'anywhere',
            },
            code: {
              color: '#ccc!important',
              background: '#2d2d2d!important',
              padding: '0.1em 0.3em',
              'border-radius': '0.3em',
              'white-space': 'normal',
              '&::before': {
                display: 'none',
              },
              '&::after': {
                display: 'none',
              },
            },
          },
        },
      },
    },
    container: {
      center: true,
      screens: {
        sm: '100%',
        md: '100%',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [typography],
  darkMode: 'class',
};
