import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green:      '#1D9E75',
          'green-dark': '#0F6E56',
          header:     '#0D4A2C',
          amber:      '#EF9F27',
          red:        '#E24B4A',
          surface:    '#F4F2ED',
          card:       '#FFFFFF',
          'text-primary': '#1A1A18',
          'text-muted':   '#5A5A52',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        card:  '12px',
        input: '8px',
      },
    },
  },
  plugins: [],
}

export default config
