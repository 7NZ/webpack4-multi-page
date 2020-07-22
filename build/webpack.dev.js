const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: '../dist',
    // watchContentBase: true,
    // 热模块替换，配合HotModuleReplacementPlugin
    // html-webpack-plugin 当改变html文件时无法更新，也不会刷新页面
    // hot: true,
    // host: '0.0.0.0', // 如需局域网访问，设置此项后重新运行命令，访问本机ip加端口号
    port: 8070,
    // 设置代理
    proxy: {
      '/apis': {
        target: 'http://127.0.0.1',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/apis': ''
        }
      }
    }
  },
  output: {
    publicPath: '/'
  },
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin()
  // ]
});
