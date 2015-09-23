var path = require('path');

module.exports = {
    entry: './src/threejs-layer.js',
    output: {
        path: path.join(__dirname, '..', 'dist'),
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    }
};