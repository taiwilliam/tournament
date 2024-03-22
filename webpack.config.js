const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    devServer: {
        static: './src'
    },
    resolve: {
        alias: { '@': path.join(__dirname, 'src') }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html'
        })
    ]
}
