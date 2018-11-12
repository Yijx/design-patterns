'use strict'
const merge = require('webpack-merge')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const ExtractTextWebpack = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const pages = require('./pages-template.js')
const HappyPack = require('happypack')
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
// const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const chalk = require('chalk')

HappyPack.SERIALIZABLE_OPTIONS = HappyPack.SERIALIZABLE_OPTIONS.concat([
  'postcss'
])
console.log('process.env.PROJECT_VERSION', process.env.PROJECT_VERSION)
console.log('process.env.FORMAL', process.env.FORMAL)

const isDev = process.env.NODE_ENV === 'development'

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const cssLoader = isDev
  ? 'happypack/loader?id=css-dev'
  // : ExtractTextWebpack.extract({
  //   fallback: 'style-loader',
  //   use: [
  //     {
  //       loader: 'css-loader',
  //       options: {
  //         minimize: true
  //       }
  //     },
  //     {
  //       loader: 'postcss-loader'
  //     },
  //     {
  //       loader: 'less-loader'
  //     }]
  // })
  : [
    {
      loader: MiniCssExtractPlugin.loader
    },
    {
      loader: 'css-loader',
      options: {
        minimize: true
      }
    },
    {
      loader: 'postcss-loader'
    },
    {
      loader: 'less-loader'
    }
  ]
const fileLoader = path => {
  return isDev
    ? [
      {
        loader: 'file-loader',
        options: {
          name: `${path}/[name]-[hash:5].[ext]`
        }
      }
    ]
    : [
      {
        loader: 'url-loader',
        options: {
          name: `${path}/[name]-[hash:5].[ext]`,
          limit: 1000
        }
      }
    ]
}
const baseConfig = {
  mode: process.env.NODE_ENV || 'production',
  entry: {
    global: isDev
      ? [
        'babel-polyfill',
        'event-source-polyfill',
        'webpack-hot-middleware/client?reload=true'
      ]
      : ['babel-polyfill']
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: isDev ? 'js/[name].[hash].js' : 'js/[name].[chunkhash].js',
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js'],
    alias: {
      '@': resolve('src/pages'),
      common: resolve('src/common'),
      components: resolve('src/components')
    }
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, resolve('src/common/static')],
        include: resolve('src'),
        use: 'happypack/loader?id=js'
      },
      {
        test: /\.(less|css)$/,
        use: cssLoader
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: fileLoader('css/images').concat(
          !isDev
            ? {
              loader: 'img-loader'
            }
            : []
        )
      },

      {
        test: /\.(eot|woff2?|ttf|svg|otf)$/,
        use: fileLoader('css/font')
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader'
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        global: {
          name: 'global',
          chunks: 'initial',
          minChunks: Infinity
        },
        vender: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vender',
          minChunks: Infinity,
          priority: 10,
          enforce: true
        }
      }
    }
  },
  plugins: [
    // new ExtractTextWebpack({
    //   filename: 'css/[name].[hash].css'
    // }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css'
    }),
    new HappyPack({
      id: 'js',
      loaders: ['babel-loader?cacheDirectory'],
      threadPool: happyThreadPool
    }),
    new HappyPack({
      id: 'css-dev',
      loaders: ['style-loader', 'css-loader', 'less-loader'],
      threadPool: happyThreadPool
    }),
    new webpack.DefinePlugin({
      'process.env.PROJECT_VERSION': JSON.stringify(process.env.PROJECT_VERSION),
      'process.env.FORMAL': JSON.stringify(process.env.FORMAL)
    }),
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      clear: false
    })
  ]
}
// 非上传正式服 不开启此选项
if (!isDev) {
} else {
  baseConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = merge([baseConfig].concat(pages))
