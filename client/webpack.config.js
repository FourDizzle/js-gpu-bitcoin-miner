const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: { main: './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'miner.js'
  },
  module: {
    rules: [
      {
        test: /\.worker.js$/,
        use: { loader: 'worker-loader' }
      },
      {
        test: /\.glsl$/,
        exclude: /node_modules/,
        use: { loader: 'webpack-glsl' }
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
