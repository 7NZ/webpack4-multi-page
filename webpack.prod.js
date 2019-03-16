// const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    // clean 'dist' directory before webpack package
    new CleanWebpackPlugin(['dist']),
    new UglifyJSPlugin({
      sourceMap: true
    })
  ]
});
