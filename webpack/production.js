var webpack = require('webpack');

var merge = require('node.extend');
var base = require('./base.js');

module.exports = merge(true, base, {
    output: {
        filename: 'threejs-layer.min.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    plugins: [
        // optimizations
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
    ]
});
