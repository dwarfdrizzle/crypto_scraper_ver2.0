const path = require('path');

module.exports = {
  // Entry point of your application
  entry: './frontend/static/js/main.js', // Adjust this path to where your main JS file is located
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'frontend/static/dist'), // The output directory
    filename: 'bundle.js' // The name of the output file
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Use Babel loader for JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'] // Preset used for env setup
          }
        }
      }
    ]
  },
  // Optional: Configure webpack-dev-server
  devServer: {
    contentBase: './dist',
  },
};