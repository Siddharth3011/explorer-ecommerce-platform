/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 28s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-mid': 'float 4.5s ease-in-out infinite 1.2s',
        'float-fast': 'float 3.8s ease-in-out infinite 0.6s',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'badge-pop': 'badgePop 1.8s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.4)' },
          '50%': { boxShadow: '0 0 50px rgba(99,102,241,0.9), 0 0 100px rgba(168,85,247,0.3)' },
        },
        badgePop: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.85' },
        },
      },
      backgroundImage: {
        'hero-mesh': 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
