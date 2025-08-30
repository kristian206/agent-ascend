// tailwind.config.js (snippet)
export default {
  theme: {
    extend: {
      colors: {
        'aa-blue': {
          700: '#073B7A',
          600: '#0C4DA2',
          500: '#2E6FD6',
          300: '#7FA9F5',
        },
        'surface': {
          50: '#F7FAFF',
          100: '#EEF5FF',
        },
        'ink': {
          900: '#0A1220',
        },
        'accent': {
          lavender: '#E6D9FF',
          lime: '#DFF2B2',
          seafoam: '#CDEFE6',
        }
      },
      backgroundImage: {
        'liquid-gradient': 'radial-gradient(120% 120% at 10% 0%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 60%), radial-gradient(100% 100% at 90% 10%, rgba(226,214,255,.35) 0%, rgba(226,214,255,0) 45%), linear-gradient(180deg, #0C4DA2 0%, #073B7A 100%)',
      },
      dropShadow: {
        glow: '0 0 10px rgba(255,255,255,0.6)',
      },
      borderRadius: {
        '2xl': '1.5rem',
      }
    }
  }
}