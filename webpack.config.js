const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/TournamentJS/index.js',
    devServer: {
        static: './src'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'tournamentjs.bundle.js',
        library: 'TournamentJS',
        libraryTarget: 'umd',
        globalObject: 'this',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js', '.cjs', '.json'],
        alias: {
            '@': path.join(__dirname, 'src'),
            vendors: path.resolve(__dirname, 'src/vendors/')
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            },
            {
                test: /\.scss$/, // 匹配 SCSS 檔案
                use: [
                    'style-loader', // 把 CSS 加入到 DOM 中
                    'css-loader', // 解析  CSS
                    'sass-loader' // 解析 SCSS
                ]
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.json$/,
                type: 'json'
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html'
        })
    ]
}
