/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Disable Tailwind Preflight (base reset) to prevent overriding the WordPress theme styles
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            colors: {
                'wise-purple': '#8B5CF6',
                'wise-dark': '#1e1b4b',
                'wise-bg': '#F8FAFC',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}