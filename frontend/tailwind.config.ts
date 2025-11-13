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
      },
      borderRadius: {
        xl: '12px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(11, 108, 241, 0.08)',
        'medium': '0 4px 16px rgba(11, 108, 241, 0.12)',
        'large': '0 8px 32px rgba(11, 108, 241, 0.16)',
      },
    },
  },
  plugins: [],
}

export default config
