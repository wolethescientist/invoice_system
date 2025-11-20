import type { Config } from 'tailwindcss'

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
          50: '#F5F9FF',
          100: '#EEF6FF',
          200: '#D6EBFF',
          300: '#BFE3FF',
          400: '#8CCFFF',
          500: '#0B6CF1',
          600: '#0A5FD6',
          700: '#055BB5',
          800: '#044A94',
          900: '#033973',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F6F9FF',
          200: '#F0F4F8',
          300: '#E6EEF9',
          400: '#D1DBE8',
          500: '#9CA3AF',
          600: '#6B7280',
          700: '#4B5563',
          800: '#374151',
          900: '#1F2937',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(11, 108, 241, 0.08)',
        'medium': '0 4px 16px rgba(11, 108, 241, 0.12)',
        'large': '0 8px 32px rgba(11, 108, 241, 0.16)',
        'glow': '0 0 20px rgba(11, 108, 241, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
