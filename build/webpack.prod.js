const path = require('path');
const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');

// mode 只有 "development" | "production" | "none" 三种
// 在package.json中定义了一个测试服环境打包命令，但是其中的NODE_ENV在webpack的配置mode选项中会被覆盖掉
// 在其它js中判断环境变量都是从webpack配置中的mode里面读取的
// 测试服环境打包的时候将此选项设置成none
const prodMode = process.env.NODE_ENV  === 'production' ? 'production' : 'none';

module.exports = merge(common, {
  mode: prodMode,
  plugins: [
    // clean 'dist' directory before webpack package
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['../dist'],
      dry: false,
      dangerouslyAllowCleanPatternsOutsideProject: true,
    }),
    new TerserPlugin({
      sourceMap: true
    })
  ]
});
