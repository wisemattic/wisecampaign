/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports = withMT({
  // prefix: 'tw-',
  // purge: {
  //   content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  media: false,
  theme: {
    extend: {},
    variants: {
      extend: {
        opacity: ['disabled'],
      },
    },
  },
  plugins: [],
});