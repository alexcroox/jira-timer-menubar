const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$/i,
        loader: 'url-loader?limit=10000',
      },
      {
        test: /\.node$/,
        loader: 'node-loader'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.json'],
  },

  plugins: [],

  externals: {},

  target: 'electron-renderer',
};
