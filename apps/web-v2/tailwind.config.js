/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base themes - using CSS variables for dynamic theme switching
        light: {
          bg: 'var(--light-bg)',
          'bg-elevated': 'var(--light-bg-elevated)',
          text: 'var(--light-text)',
          'text-muted': 'var(--light-text-muted)',
          border: 'var(--light-border)',
        },
        dim: {
          bg: 'var(--dim-bg)',
          'bg-elevated': 'var(--dim-bg-elevated)',
          text: 'var(--dim-text)',
          'text-muted': 'var(--dim-text-muted)',
          border: 'var(--dim-border)',
        },
        dark: {
          bg: 'var(--dark-bg)',
          'bg-elevated': 'var(--dark-bg-elevated)',
          text: 'var(--dark-text)',
          'text-muted': 'var(--dark-text-muted)',
          border: 'var(--dark-border)',
        },

        // Semantic brand colors
        brand: {
          DEFAULT: '#21a1f1',
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#21a1f1',
          600: '#1890ff',
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c',
        },

        // Vibe system colors
        vibe: {
          positive: '#4caf50',
          'positive-hover': '#45a049',
          negative: '#ab1c1c',
          'negative-hover': '#991818',
        },
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.3' }], // 12px - labels
        sm: ['0.875rem', { lineHeight: '1.4' }], // 14px - metadata
        base: ['1rem', { lineHeight: '1.5' }], // 16px - body
        lg: ['1.125rem', { lineHeight: '1.5' }], // 18px - emphasis
        xl: ['1.25rem', { lineHeight: '1.4' }], // 20px - h3
        '2xl': ['1.5rem', { lineHeight: '1.3' }], // 24px - h2
        '3xl': ['2rem', { lineHeight: '1.2' }], // 32px - h1
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      spacing: {
        xs: '0.25rem', // 4px
        sm: '0.5rem', // 8px
        md: '0.75rem', // 12px
        // base: '1rem',   // 16px (default)
        // lg: '1.5rem',   // 24px (default)
        // xl: '2rem',     // 32px (default)
        '2xl': '3rem', // 48px
        '3xl': '4rem', // 64px
      },

      borderRadius: {
        sm: '0.375rem', // 6px
        DEFAULT: '0.5rem', // 8px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
        full: '9999px',
      },

      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },

      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
