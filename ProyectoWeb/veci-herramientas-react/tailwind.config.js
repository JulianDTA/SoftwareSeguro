/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neo': '6px 6px 0px 0px rgba(0,0,0,1)',      
        'neo-hover': '10px 10px 0px 0px rgba(0,0,0,1)', 
        'neo-sm': '3px 3px 0px 0px rgba(0,0,0,1)',
      },
      colors: {
        'neo-bg': '#f4f4f0',     
        'neo-main': '#FF6B6B',    
        'neo-accent': '#4ECDC4',  
        'neo-yellow': '#FFE66D', 
        'neo-dark': '#1A1A1A',   
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}