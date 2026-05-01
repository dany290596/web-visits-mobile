/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'system-ui', 'sans-serif'],
                nunito: ['Nunito Sans', 'sans-serif'],
            },
            colors: {
                border: 'var(--border)',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                // ---------- NUEVAS ANIMACIONES ----------
                'fade-out-up': {
                    from: { opacity: '1', transform: 'translateY(0px)' },
                    to: { opacity: '0', transform: 'translateY(10px)' },
                },
                'fade-in-down': {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-out-down': {
                    from: { opacity: '1', transform: 'translateY(0px)' },
                    to: { opacity: '0', transform: 'translateY(10px)' },
                },
                'wiggle': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                // ----------------------------------------
            },
            animation: {
                'fade-in-up': 'fade-in-up 0.3s ease-out',
                // ---------- NUEVAS ANIMACIONES ----------
                'fade-out-up': 'fade-out-up 0.3s ease-out',
                'fade-in-down': 'fade-in-down 0.3s ease-out',
                'fade-out-down': 'fade-out-down 0.3s ease-out',
                'wiggle': 'wiggle 1s ease-in-out infinite',
                // ----------------------------------------
            },
            // ---------- NUEVA SOMBRA ----------
            boxShadow: {
                'custom': '0px 0px 50px 0px rgb(82 63 105 / 15%)',
            },
            // ---------------------------------
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
        require('tailwind-scrollbar'),
    ],
};