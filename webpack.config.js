const webpack = require('webpack');
// console.log(olm)
module.exports = {
    entry: './app/index.js',
    resolve: {
        alias: {
          'vue': 'vue/dist/vue.min.js',
        }
    },
    output: {
        path: './bin',
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel',
        }, 
        { test: /\.css$/, loader: "style-loader!css-loader" }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
    ]
}
