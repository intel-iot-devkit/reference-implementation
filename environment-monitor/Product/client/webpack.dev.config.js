"use strict";

var path        = require('path');
var SRC_DIR     = path.resolve(__dirname, 'src');

module.exports = {
  entry: [
    SRC_DIR + '/index.js'
  ],
  module: {
    loaders: [
      { test: /\.html$/, loader: "html"},
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: [/node_modules/, /dist/],
        query: {presets: ["es2015"]}
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    progress: false,
    historyApiFallback: true,
    stats: 'errors-only'
  }
};