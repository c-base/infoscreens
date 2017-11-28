module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'dist/infoscreens.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['transform-class-properties'],
          }
        }
      }
    ]
  }
};
