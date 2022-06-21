const Path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  mode: 'development',
  // devtool: 'cheap-module-eval-source-map',
  entry: {
    main: './src/index.js',
  },
  devServer: {
    contentBase: './dist',  // 根目录；
    progress: true, // 显示打包的进度条；
    open: true, // 自动打开浏览器；
    port: 8080, // 打开的端口；
    hot: true,  
  },
  module: {
    rules: [  
    {
      test: /\.js$/,
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env'
        ]
      }
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  plugins: [
    // 用于生成index.html
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: Path.resolve(__dirname, 'dist'),  // 必须使用绝对路径
  }
}

module.exports = config;