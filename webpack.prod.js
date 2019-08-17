// const webpack = require('webpack');
const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    // clean 'dist' directory before webpack package
    new CleanWebpackPlugin({
    	cleanAfterEveryBuildPatterns: ['dist']
    }),
    new TerserPlugin({
      sourceMap: true
    })
  ]
});
