const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
// const autoprefixer = require('autoprefixer');

const devMode = process.env.NODE_ENV !== 'production';


module.exports = {
  entry: {
    index: './src/js/index.js',
    loader_intru: './src/js/loader-intru.js',
    plugin_intru: './src/js/plugin-intru.js',
  },
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        test: /\.js(\?.*)?$/i,
        exclude: "./node_modules",
      }),
    ],
    splitChunks: {
      cacheGroups: {
        // 打包公共模块，js和css公共代码都会被提取出来
        // html-webpack-plugin 必须要在chunks选项里面加上name值，页面公共代码才会被注入
        commons: {
          chunks: 'initial', // 表示从哪些chunks里面抽取代码，除了三个可选字符串值 initial、async、all 之外，还可以通过函数来过滤所需的 chunks
          minChunks: 2, // 表示被引用次数，默认为1
          minSize: 0, // 表示抽取出来的文件在压缩前的最小大小，默认为 30000
          name: 'common' //提取出来的文件命名
        },
        /* js: {
          test: /\.js$/,
          name: 'public',
          chunks: 'all',
          minChunks: 2,
          minSize: 0
        },
        // 虽然是对css公共代码提取，但是这里还是会生成对应的js文件，里面有一行代码（不会影响页面），并被页面引入
        css: {
          test: /\.(css|sass|scss)$/,
          name: 'common',
          chunks: 'all',
          minChunks: 3,
          minSize: 0
        }, */
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : {
            loader:MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          'css-loader',
          // https://stackoverflow.com/questions/41609397/uncaught-error-module-build-failed-error-no-postcss-config-found-in-ng2-adm/41758053#41758053
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash:6].[ext]',
              outputPath: 'images/',
              limit: 8192,
              // publicPath: '../images/'
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'css/font/',
              limit: 10000,
              // publicPath: '../css/font/'
            }
          }
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    // define global variable
    new webpack.DefinePlugin({
      APIROOT: JSON.stringify( devMode ? '/apis' : 'https://www.apidomain.com'),
    }),
    // 自动加载模块，而不必到处 import 或 require
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? 'css/[name].css' : 'css/[name].[contenthash].css',
      // chunkFilename: devMode ? 'css/[id].css' : 'css/[id].[hash].css',
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      },
      canPrint: true
    }),
    // copy js library if you don't want to import it in your own js files
    // You need to link it in HTML files
    new CopyPlugin([
      { 
        from: path.resolve(__dirname, 'src/js/lib'),
        to: path.resolve(__dirname, 'dist/js/lib'),
        force: true
      }
    ]),
    // js会通过script标签注入到body标签最底部
    // 如果有本地库引入，不能把本地库引入的script标签放到body标签的后面
    // 否则生产环境打包出来的页面里自己的js会在第三方js库之前引入
    new HtmlWebpackPlugin({
      chunks: ['index','common'],
      filename:'index.html',
      template: './src/pages/index.html',
      inject: 'body',
      title: 'webpack-index',
      minify: {
        removeComments: true, // 移除HTML中的注释
        collapseWhitespace: true, // 删除空白符与换行符
        minifyCSS: true, // 压缩内联css
        //是否压缩html里的js（使用uglify-js进行的压缩，目前es6代码无法压缩https://github.com/jantimon/html-webpack-plugin/issues/929）
        minifyJS: true
      }
    }),
    new HtmlWebpackPlugin({
      chunks: ['loader_intru','common'],
      filename:'loader-intru.html',
      template: './src/pages/loader-intru.html',
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      chunks: ['plugin_intru','common'],
      filename:'plugin-intru.html',
      template: './src/pages/plugin-intru.html',
      inject: 'body'
    }),
  ]
  
};
