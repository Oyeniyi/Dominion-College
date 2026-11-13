import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#5B1A69',
          'primary-dark': '#3B0F47',
          secondary: '#7A288C',
          'secondary-light': '#F5ECF7',
          accent: '#D97706',
          'accent-hover': '#B45309',
          'accent-light': '#FEF3C7',
          'on-primary': '#FFFFFF',
        },
        surface: {
          canvas: '#FAF8FC',
          card: '#FFFFFF',
          muted: '#F3EFF6',
          border: '#E2D9E8',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif',
        ],
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;

