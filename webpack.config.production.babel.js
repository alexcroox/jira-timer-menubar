const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./webpack.config.base');

const config = merge(baseConfig, {
  entry: ['babel-polyfill', './renderer/index'],

  output: {
    publicPath: './dist/',
  },

  mode: 'production',

  plugins: [
    new UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
});

module.exports = config;
