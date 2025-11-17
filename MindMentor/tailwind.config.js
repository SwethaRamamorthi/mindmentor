/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',   // Very light blue
          100: '#e0f2fe',  // Light blue
          200: '#bae6fd',  // Light blue
          300: '#7dd3fc',  // Medium light blue
          400: '#38bdf8',  // Medium blue
          500: '#0ea5e9',  // Main blue
          600: '#0284c7',  // Darker blue
          700: '#0369a1',  // Dark blue
          800: '#075985',  // Very dark blue
          900: '#0c4a6e',  // Darkest blue
        },
        secondary: {
          50: '#ffffff',   // Pure white
          100: '#f8fafc',  // Off white
          200: '#f1f5f9',  // Light gray-white
          300: '#e2e8f0',  // Light gray
          400: '#cbd5e1',  // Medium gray
          500: '#94a3b8',  // Gray
          600: '#64748b',  // Dark gray
          700: '#475569',  // Darker gray
          800: '#334155',  // Very dark gray
          900: '#1e293b',  // Darkest gray
        },
        accent: '#93C5FD', // Light blue accent
        background: '#FFFFFF', // Pure white background
        text: '#1E293B', // Dark blue-gray text
        'bubble-user': '#3B82F6', // Light blue for user messages
        'bubble-ai': '#F1F5F9', // Light gray-white for AI messages
        'glass-bg': 'rgba(255, 255, 255, 0.9)', // White glass effect
        'glass-border': 'rgba(59, 130, 246, 0.2)', // Light blue border
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'gradient-pulse': 'gradient-pulse 10s ease infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'blink': 'blink 1s infinite',
        'breathing': 'breathing 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-pulse': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'breathing': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      }
    },
  },
  plugins: [],
}
