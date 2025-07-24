
const defaults = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const config = { ...defaults,
    output: {
        ...defaults.output,
        path: path.resolve(__dirname, '../build'), // Set the custom output directory
        filename: '[name].js', // Adjust file naming if needed
        publicPath: '/', // Adjust base URL for assets
    },
    entry: {
        index: './src/main.jsx', // For admin scripts.
    }
 };

module.exports = config;