const webpack = require('webpack');
const path = require('path')
module.exports = {
    entry: './app/index.js',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    resolve: {
        alias: {
          'vue': 'vue/dist/vue.min.js',
        }
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {test: /\.js$/ , loader:'babel-loader', exclude: '/node_modules/'},
            {test: /\.jsx$/ , loader:'babel-loader', exclude: '/node_modules/'},
            { 
                test: /\.css$/, 
                loader: "style-loader!css-loader" 
            }
        ],
    }
}
