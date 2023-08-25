const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const TerserJSPlugin = require('terser-webpack-plugin')

const devMode = process.env.NODE_ENV !== 'production'
const pkg = require('../package.json')

const config = {
  mode: devMode ? 'development' : 'production',
  entry: ['./tools/index.ts'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: devMode ? 'hsu-cesium-uilts.js' : 'hsu-cesium-uilts.min.js',
    globalObject: 'this',
    library: 'hsu-cesium-uilts',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json')
        }
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts'],
    alias: {}
  },
  plugins: [
    new webpack.BannerPlugin(
      `\nhsu-cesium-uilts v${pkg.version} \n\n${pkg.description} \n\n${fs.readFileSync(path.join(process.cwd(), 'LICENSE'))}`
    ),
  ],
  optimization: {
    minimizer: devMode
      ? []
      : [
          // 压缩js代码
          // webpack v5 使用内置的TerserJSPlugin替代UglifyJsPlugin，因为UglifyJsPlugin不支持ES6
          new TerserJSPlugin({
            parallel: true // 使用多进程并行运行
          }),
        ]
  }
}

module.exports = config