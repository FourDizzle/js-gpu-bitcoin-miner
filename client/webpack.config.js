const path = require('path');
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
  }
};
