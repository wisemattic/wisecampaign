/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    important: '.wisecampaign-tw', // Scoping Tailwinds to avoid conflicts in admin area
  }
