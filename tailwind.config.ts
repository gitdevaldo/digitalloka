import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        quaternary: 'var(--quaternary)',
        border: 'var(--border)',
        input: 'var(--input)',
        card: 'var(--card)',
        shadow: 'var(--shadow)',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        pop: '4px 4px 0 0 var(--shadow)',
        'pop-hover': '6px 6px 0 0 var(--shadow)',
        'pop-sm': '2px 2px 0 0 var(--shadow)',
        'pop-active': '1px 1px 0 0 var(--shadow)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        wiggle: 'wiggle 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
