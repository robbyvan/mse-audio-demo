const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/static'),
    filename: '[name].bundle.js',
    publicPath: '/static'
  },
  devtool: 'source-map',
  devServer: {
    clientLogLevel: 'warning',
    contentBase: './dist',
    hot: true,
    host: 'localhost',
    port: '8000',
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   loader: 'babel-loader',
      //   include: [path.resolve(__dirname, 'src')]
      // }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist/static']),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
  ]
}