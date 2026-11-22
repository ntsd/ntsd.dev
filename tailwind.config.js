import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  safelist: ['-translate-y-full', 'max-h-screen'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              'line-break': 'anywhere',
            },
            ':not(pre) > code': {
              color: '#18181b',
              backgroundColor: '#f4f4f5',
              border: '1px solid #e4e4e7',
              padding: '0.15em 0.4em',
              borderRadius: '0.375rem',
              fontWeight: '500',
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
              borderRadius: '0.75rem',
              padding: '1.25rem',
              overflowX: 'auto',
            },
            'pre code': {
              color: 'inherit',
              backgroundColor: 'transparent',
              border: 'none',
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
        xl: '1152px',
      },
    },
  },
  plugins: [typography],
  darkMode: 'class',
};
