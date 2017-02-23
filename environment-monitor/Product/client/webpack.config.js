var webpack           = require('webpack');
var browserSyncPlugin = require('browser-sync-webpack-plugin');
var html              = require('html-webpack-plugin');
var merge             = require('webpack-merge');
var path              = require('path');
var cssimport         = require("postcss-import")
var cssnext           = require("postcss-cssnext")
var extractor         = require('extract-text-webpack-plugin');
var devConfig         = require('./webpack.dev.config');
var distConfig        = require('./webpack.dist.config');


var SRC_DIR = path.resolve(__dirname, 'src');

var config = {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader!postcss-loader",
        exclude: [/node_modules/, /dist/]
      },
      {test: /\.svg$/,  loader: 'url?limit=25000&mimetype=image/svg+xml' },
      {test: /\.jpg$/,  loader: 'url?limit=25000&mimetype=image/jpeg' },
      {test: /\.gif$/,  loader: 'url?limit=25000&mimetype=image/gif' },
      {test: /\.png$/,  loader: 'url?limit=25000&mimetype=image/png' },
      {test: /\.(eot|ttf|woff|woff2)$/, loader: 'url?limit=25000'}
    ]
  },
  plugins: [
    new extractor('air-quality.css'),
    new html({
      template: SRC_DIR + '/index.html'
    }),
    new browserSyncPlugin(
      // BrowserSync options 
      {
        // the normal webpack dev server port
        proxy: 'http://localhost:8080/',
        // should be routed to this new browsersync port
        port: 3000,
        // browse to http://localhost:3000/ during development 
        host: 'localhost'
      },
      {
        // prevent BrowserSync from reloading the page 
        // and let Webpack Dev Server take care of this 
        reload: false
      }
    )
  ],
  postcss: function () {
    return [cssimport, cssnext];
  }
};


// npm run dist vs npm run dev needs different config settings
switch (process.env.NODE_ENV) {
  //development mode (runs server, compiles test bed pages)
  case 'development':
    config = merge(config, devConfig)
    break;

  //production mode (exports compile library files)
  case 'production':
    config = merge(config, distConfig)
    break;
}

module.exports = config;
