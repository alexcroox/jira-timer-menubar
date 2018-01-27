const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const baseConfig = require('./webpack.config.base');

// PostCSS
const postcssImport = require('postcss-import');
const cssnext = require('postcss-cssnext');

const config = merge(baseConfig, {
  entry: ['babel-polyfill', './src/index'],

  output: {
    publicPath: './dist/',
  },

  module: {
    rules: [],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
      },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
});

module.exports = config;
