const WebpackDevMiddleware = require('webpack-dev-middleware')
const WebpackHotMiddleware = require('webpack-hot-middleware')
const https = require('https')
const proxy = require('http-proxy-middleware')
const express = require('express')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.base')
const path = require('path')
const requestUrl = process.env.NODE_ENV === 'development' ? 'https://192.168.1.135' : ''
const entries = require('./utils.js')

// webpack编译器
let compiler = webpack(webpackConfig)
let app = express()

// 代理设置
app.use(['/account/*', '/upload/*', '/works/*', '/personal/*', '/drm/*', '/order/*'], proxy({
  target: requestUrl,
  changeOrigin: true,
  logLevel: 'debug',
  agent: https.globalAgent,
  secure: false
}))
// webpack-dev-server中间件
app.use(
  WebpackDevMiddleware(compiler, {
    publicPath: 'http://localhost:9090/',
    stats: {
      colors: true,
      chunks: false
    },
    progress: true,
    inline: true,
    hot: true
  })
)
app.use(WebpackHotMiddleware(compiler))
// 路由
app.get('/:pagename?', manageRequest)
app.get('/:pagename?/*', manageRequest)
const keys = Object.keys(entries)
function manageRequest (req, res, next) {
  let name = req.params.pagename
  if (keys.length && keys.indexOf(name) === -1) {
    res.redirect('./' + keys[0])
    return
  }
  var pagename = ''
  if (name) {
    pagename = entries[name].outputPath
    if (entries[name].outputPath) {
      pagename += '/'
    }
    pagename += `${entries[name].htmlPath}.html`
  } else {
    pagename = 'index.html'
  }

  var filepath = path.resolve(__dirname, '../dist', pagename)
  // 使用webpack提供的outputFileSystem
  compiler.outputFileSystem.readFile(filepath, function (err, result) {
    if (err) {
      // something error
      return next(
        '输入路径无效，请输入目录名作为路径，有效路径有：\n/' +
        keys.join('\n/')
      )
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
}

module.exports = app.listen(9090, function (err) {
  if (err) {
    // do something
    return
  }

  console.log('Listening at http://localhost:9090\n')
})
