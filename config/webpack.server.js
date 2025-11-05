var HtmlWebpackPlugin = require('html-webpack-plugin')
var debug = process.env.NODE_ENV !== "production";
var webpack = require("webpack");

var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/public/index.html',
    filename: 'index.html',
    inject: 'body'
});

module.exports = {
    devtool: debug ? "inline-sourcemap" : null,
    entry: [
        './index.js'
    ],
    output: {
        path: __dirname + '/build',
        publicPath: '/',
        filename: "index_bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: debug ? [HTMLWebpackPluginConfig] : [
        HTMLWebpackPluginConfig,
        new webpack.optimize.CommonsChunkPlugin('common.js'),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
        new webpack.optimize.AggressiveMergingPlugin()
    ],
};