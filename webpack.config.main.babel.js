const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./webpack.config.base');

const config = merge(baseConfig, {
  entry: ['babel-polyfill', './main.js'],

  output: {
    publicPath: './dist/',
    filename: 'main.js',
  },

  plugins: [
    new UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],

  target: 'electron-main',
});

module.exports = config;
