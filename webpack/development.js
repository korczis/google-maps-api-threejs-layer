var merge = require('node.extend');
var path = require('path');
var webpack = require('webpack');

var base = require('./base.js');


module.exports = merge(true, base, {
    devtool: 'inline-source-map',
    context: path.resolve(__dirname, '..'),
    output: {
        filename: 'threejs-layer.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    }
});
