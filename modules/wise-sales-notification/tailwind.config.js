/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../shared/**/*.{js,jsx}",
    ],
    // Scope utilities under the app root so they win over WordPress admin form styles
    important: '#wise-sales-notification-app',
    // Disable Tailwind Preflight (base reset) to prevent overriding the WordPress admin styles
    corePlugins: {
        preflight: false,
    },
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
