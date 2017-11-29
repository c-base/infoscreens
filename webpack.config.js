module.exports = {
  entry: {
    infoscreens: './index.js',
    infodisplay: './infodisplay/infodisplay.js',
  },
  output: {
    path: __dirname,
    filename: 'dist/[name].js',
    library: '[name]',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /paho.mqtt.js/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['transform-class-properties'],
          }
        }
      }
    ]
  },
  externals: {
    newrelic: 'commonjs newrelic',
    tv4: 'commonjs tv4',
    'ampqlib/callback_api': 'commonjs ampqlib/callback_api',
    mqtt: 'commonjs mqtt',
  },
  node: {
    fs: 'empty',
  },
};
