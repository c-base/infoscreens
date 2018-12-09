const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    infoscreens: './index.js',
    infodisplay: './infodisplay/infodisplay.js',
    calendar: './events/calendar.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib/[name].js',
    library: '[name]',
    libraryTarget: 'umd',
  },
  mode: 'production',
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
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: '**/index.html',
        to: './',
      },
      {
        from: '**/*.svg',
        to: './',
      },
      {
        from: 'theme/*',
        to: './',
      },
      {
        from: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js',
        to: './vendor/webcomponentsjs/webcomponents-lite.js',
      },
      {
        from: 'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
        to: './vendor/webcomponentsjs/custom-elements-es5-adapter.js',
      },
      {
        from: 'node_modules/plotly.js/dist/plotly.min.js',
        to: './vendor/plotly.js/plotly.min.js',
      },
    ]),
  ],
  externals: {
    newrelic: 'commonjs newrelic',
    tv4: 'commonjs tv4',
    'ampqlib/callback_api': 'commonjs ampqlib/callback_api',
    mqtt: 'commonjs mqtt',
  },
  node: {
    fs: 'empty',
  },
  devServer: {
    host: process.env.HOST || 'localhost',
    port: 3000,
    inline: true,
  },
};
