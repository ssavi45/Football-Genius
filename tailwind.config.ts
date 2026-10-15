import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          black: '#050B07',
          dark: '#08140C',
          card: '#0D1E13',
          cardHover: '#13281B',
          pill: '#0C1C11',
          silhouette: '#0F1E13',
          silhouetteIcon: '#253B2B',
        },
        neon: {
          green: '#2EFD72',
          glow: '#00FF87',
          turf: '#00C853',
        },
        trophy: {
          gold: '#FFC72C',
          amber: '#F59E0B',
        },
        surface: {
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(255, 255, 255, 0.14)',
          glass: 'rgba(13, 30, 19, 0.75)',
        },
        brand: {
          blue: '#0066FF',
          blueHover: '#0052CC',
          lightBlue: '#EFF6FF',
          darkBlue: '#0A2540',
          cyan: '#00D4FF',
          navy: '#0B1E36',
        },
        scoreboard: {
          red: '#FF2A4B',
          redGlow: 'rgba(255, 42, 75, 0.7)',
          blue: '#0066FF',
          blueGlow: 'rgba(0, 102, 255, 0.7)',
          green: '#00D084',
          metalLight: '#F1F5F9',
          metalBase: '#E2E8F0',
          metalDark: '#94A3B8',
          bezel: '#1E293B',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E9F92',
          muted: '#586A5D',
          dark: '#0F172A',
          subtle: '#475569',
          lightMuted: '#94A3B8',
        },
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px -3px rgba(46, 253, 114, 0.35)',
        'neon-lg': '0 0 35px -5px rgba(46, 253, 114, 0.45)',
        gold: '0 0 20px -3px rgba(255, 199, 44, 0.35)',
        card: '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

