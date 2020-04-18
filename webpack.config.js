const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].[hash].bundle.js"
    },
    module: {
        rules: [
            { test: '/\.css$/', use: ['style-loader', 'css-loader'] },
            { test: '/\.ts$/', use: 'ts-loader' }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new CopyWebpackPlugin([
            { from: './src/assets', to: 'assets' }
        ])
    ],
    resolve: {
        extensions: ['.ts', '.js', '.css']
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        hot: true,
        port: 9000
    }
}