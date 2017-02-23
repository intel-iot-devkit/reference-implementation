"use strict";

var path        = require('path');
var webpack     = require('webpack');
var clean       = require('clean-webpack-plugin');
var copy        = require('copy-webpack-plugin');

var SRC_DIR = path.resolve(__dirname, 'src');

// dist config
module.exports = {
  entry: [
    SRC_DIR + '/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'air-quality.js'
  },
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new clean([
      path.resolve(__dirname, 'dist')
    ]),
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: true }
    })
  ]
}