/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./admin/src/**/*.{js,jsx,ts,tsx}",
  ],
  important: '.wisecampaign-tw',
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};