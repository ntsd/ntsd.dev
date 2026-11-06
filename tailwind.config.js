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
            ':not(pre) > code': {
              color: '#e4e4e7',
              backgroundColor: '#27272a',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
              fontSize: '0.875em',
              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            },
            ':not(pre) > code::before': {
              content: '""',
            },
            ':not(pre) > code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#18181b',
              color: '#e4e4e7',
              borderWidth: '1px',
              borderColor: '#27272a',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              overflowX: 'auto',
            },
            'pre code': {
              color: 'inherit',
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              fontSize: '0.875rem',
              lineHeight: '1.7',
              whiteSpace: 'pre',
              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            },
          },
        },
      },
    },
    container: {
      center: true,
      screens: {
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [typography],
  darkMode: 'class',
};

