import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '600px',
      },
      colors: {
        // Colores primarios por pantalla
        primary: {
          DEFAULT: '#d70fd7',
          inicio: '#8655f6',
          aprender: '#e83086',
          avisos: '#9213ec',
          capitulo: '#4A148C',
          light: '#9575CD',
          dark: '#9c0cad',
        },
        background: {
          light: '#f8f6f8',
          dark: '#221022',
          inicio: '#f6f5f8',
          aprender: '#f8f6f7',
          capitulo: '#FAFAFA',
          avisos: '#f7f6f8',
        },
        brand: {
          blue: '#090653',
          pink: '#DC79A8',
        },
        surface: {
          light: '#ffffff',
          dark: '#2d1a2d',
        },
        lilac: {
          soft: '#f3e8f3',
          fill: '#e9d5ff',
        },
      },
      fontFamily: {
        quicksand: ['var(--font-quicksand)', 'sans-serif'],
        sans: ['var(--font-quicksand)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'ios': '0 4px 25px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 15px rgba(215, 15, 215, 0.4)',
        'glow-primary': '0 0 20px rgba(215, 15, 215, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(215, 15, 215, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(215, 15, 215, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
