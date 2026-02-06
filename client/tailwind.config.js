/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                // Approximate TEAL colors from screenshots
                teal: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6', // Login BG approx
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#115e59',
                    900: '#134e4a',
                },
                primary: {
                    light: '#2dd4bf',
                    DEFAULT: '#0d9488', // Teal 600
                    dark: '#0f766e',
                }
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'floating': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) rotate(45deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(45deg)' },
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: '0.05', transform: 'scale(1)' },
                    '50%': { opacity: '0.1', transform: 'scale(1.1)' },
                },
                'spin-slow': {
                    'from': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                    'to': { transform: 'translate(-50%, -50%) rotate(360deg)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'ecg': {
                    '0%': { strokeDashoffset: '2000' },
                    '100%': { strokeDashoffset: '0' },
                }
            },
            animation: {
                'float-slow': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
                'spin-slow': 'spin-slow 20s linear infinite',
                'blob': 'blob 7s infinite',
                'ecg': 'ecg 3s linear infinite',
            }
        },
    },
    plugins: [],
}
