## webpack4-multi-page

webpack4多页面  
作为项目参考配置，找到自己合适的。一句话：适合自己的就是最好的

### 命令

1. `npm run dev` 开发
2. `npm run build` 生产环境打包

### 遇到问题

#### 开发环境和生成环境区分  

头开始用的webpack4 自带的mode来区分，发现在配置文件webpack.common.js里面区分不了。于是尝试在package.json 里面配置命令，发现还是区分不了，不知道是不是不会配置的问题。  
后来尝试了`cross-env`依赖包，在package.json里面使用，scripts选项里面（e.g.,`"dev": "cross-env NODE_ENV=development webpack-dev-server --colors --progress --config webpack.dev.js"`）。  
这样在webpack.common.js和src下面的js都能判断，判断的时候`const devMode = process.env.NODE_ENV !== 'production'`

#### css分离MiniCssExtractPlugin  

在开发环境使用style-loader，没有分离，使用了MiniCssExtractPlugin，开始的配置如下，是按照官方文档（现在已经改了，写于2019-04-10）：  
  ```js
  {
    test: /\.(sa|sc|c)ss$/,
    use: [
      devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
      'css-loader',
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
          publicPath: '../images/'
        }
      }
    ]
  }
  ```
使用的时候url-loader或者file-loader需要加上publicPath，要不然生产环境打包出来路径不对。但是后来就发现在html文件里面引入的图片超过url-loader大小限制，打包出来路径就不对  
后来就github搜了下，找到了解决办法，就是rules里面MiniCssExtractPlugin.loader采用对象的写法,并且加上`publicPath`，url-loader或者file-loader里面就不在写publicPath，这样一来打包出来html里面图片路径也正确了
```js
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
    'postcss-loader',
    'sass-loader'
  ]
}
{
  test: /\.(gif|png|jpe?g|svg)$/i,
  use: [
    {
      loader: 'url-loader',
      options: {
        name: '[name]-[hash:6].[ext]',
        outputPath: 'images/',
        limit: 8192
      }
    }
  ]
}
```
上面css的处理也可以不要style-loader直接用MiniCssExtractPlugin.loader参照官方文档https://github.com/webpack-contrib/mini-css-extract-plugin
    
#### css和js公共代码分离splitChunks

如果配置了splitChunks来分离公共代码，那么在html-webpack-plugin插件里面就必须在chunks选项加上splitChunks的chunk，否则你引入的其他入口文件里面的js代码将会无法执行，如果开发环境下使用了style-loader，入口文件里面引入的css也不会被注入到页面（不用style-loader直接用MiniCssExtractPlugin.loader即可解决）。  
在本项目的依赖环境下webpack 4.29.5 html-webpack-plugin 3.2.0（具体请查看package.json）已经做过测试，以为是html-webpack-plugin问题，后来升级到4.0 beta还是不行。这个问题至今还存在（写于2019-04-10）。  
由于特殊情况，某个页面我不需要公共css的代码，那么不引入splitChunks就会出现上述问题。用copy-webpack-plugin的话可以直接复制文件，但是不会编译js里面es6代码
后来是采用在splitChunks中各写一个css和js的公共代码的规则，对于特殊的页面再单独写一个规则匹配使用到的css  
```
js: {
  test: /\.js$/,
  name: 'public',
  chunks: 'all',
  minChunks: 2,
  minSize: 0
},
css: {
  test: /\.(css|sass|scss)$/,
  name: 'common',
  chunks: 'all',
  minChunks: 3,
  minSize: 0
},
special: {
  test: /special.css/,
  name: 'special',
  chunks: 'all',
  minChunks: 2,
  minSize: 0
}
 ```
需要注意的是对于css的规则，还是会生成对应的js文件，里面有一行代码，并被页面引入。就是说以上2个对css匹配的规则都会生成对应name的js文件  

#### 其它

如果页面很多的话，需要复制HtmlWebpackPlugin插件配置代码，配置里面有很多类似的代码  
看了下别人都是使用了一个页面对应一个目录，入口都在对应的目录下，省去了每次新建一个页面，都要复制一下配置的麻烦
