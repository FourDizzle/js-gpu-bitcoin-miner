const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'miner.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.worker.js$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.glsl$/,
        use: { loader: 'raw-loader'}
      },
      {
        test: /\.glsl$/,
        use: { loader: 'glslify-loader' }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
};
