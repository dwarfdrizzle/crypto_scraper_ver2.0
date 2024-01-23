const path = require('path');

module.exports = {
  entry: './frontend/static/js/main.js',
  output: {
    path: path.resolve(__dirname, './frontend/static/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      // Alias for Chart.js
      'chart.js': path.resolve(__dirname, 'node_modules/chart.js'),
      // Add an alias for the Chart.js adapter you are using
      'chartjs-adapter-date-fns': path.resolve(__dirname, 'node_modules/chartjs-adapter-date-fns'),
    }
  },
  devServer: {
    contentBase: './dist',
  },
};