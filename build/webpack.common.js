const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


const OUTPUT_DIR = '../dist';
const SRC_DIR = '../src';

const ENTRY_DIR = path.resolve(__dirname, `${SRC_DIR}/js`);
const PAGES_DIR = path.resolve(__dirname, `${SRC_DIR}/pages`);
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.html'));


const devMode = process.env.NODE_ENV !== 'production';

// 入口文件，注意这里入口文件遍历的是html文件
// 取html文件名对应入口文件js，所以入口文件js需要和对应html文件命名相同
let entrys = {};
PAGES.forEach(page => {
  let name = page.slice(0, page.lastIndexOf('.'));
  entrys[name] = `${ENTRY_DIR}/${name}.js`;
});

module.exports = {
  entry: entrys,
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, OUTPUT_DIR),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, SRC_DIR),
    }
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        exclude: /\/node_modules/,
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
              limit: 10000,
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
            }
          }
        ]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, SRC_DIR),
        loader: 'eslint-loader',
        options: {
          emitWarning: true,
          configFile: path.resolve(__dirname, '../.eslintrc.js')
        }
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
      APIROOT: JSON.stringify( devMode ? '/apis' : 'https://www.apidomain.com')
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
        from: path.resolve(__dirname, `${SRC_DIR}/js/lib`),
        to: path.resolve(__dirname, `${OUTPUT_DIR}/js/lib`),
        force: true
      }
    ]),
    ...PAGES.map(page => new HtmlWebpackPlugin({
      chunks: [page.slice(0, page.lastIndexOf('.')), 'common'],
      filename: `${page}`,
      template: `${PAGES_DIR}/${page}`,
      inject: 'body',
      minify: {
        removeComments: true, // 移除HTML中的注释
        collapseWhitespace: true, // 删除空白符与换行符
        minifyCSS: true, // 压缩内联css
        minifyJS: true
      }
    })),

    /** 
     * js会通过script标签注入到body标签最底部
     *  如果有本地库引入，不能把本地库引入的script标签放到body标签的后面
     *  否则生产环境打包出来的页面里自己的js会在第三方js库之前引入
     *
     *  上面的配置统一引入了公共文件chunk，如果有页面不需要的话像这样单独写配置
     */
    /*new HtmlWebpackPlugin({
      chunks: ['index'],
      filename:'index.html',
      template: path.resolve(__dirname, '../src/pages/index.html'),
      inject: 'body',
      title: 'webpack-index',
      minify: {
        removeComments: true, // 移除HTML中的注释
        collapseWhitespace: true, // 删除空白符与换行符
        minifyCSS: true, // 压缩内联css
        minifyJS: true
      }
    }),*/
  ]
  
};
