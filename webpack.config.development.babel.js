const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

// PostCSS
const stylelint = require('stylelint');
const postcssImport = require('postcss-import');
const cssnext = require('postcss-cssnext');
const postcssReporter = require('postcss-reporter');

const config = merge(baseConfig, {
  devtool: 'eval',

  entry: [
    'webpack-hot-middleware/client?reload=true&path=http://localhost:9000/__webpack_hmr',
    'babel-polyfill',
    './src/index',
  ],

  output: {
    publicPath: 'http://localhost:9000/dist/',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: loader => [
                stylelint,
                postcssImport({
                  root: loader.resourcePath,
                }),
                cssnext({browsers: ['last 2 versions', 'IE > 10']}),
                postcssReporter({clearMessages: true}),
              ],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname,
      },
      debug: true,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
});

module.exports = config;
