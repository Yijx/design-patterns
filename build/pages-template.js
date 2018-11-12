const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true'
const entries = require('./utils.js')

const resolve = function (dir) {
  return path.join(__dirname, '../', dir)
}
const isDev = process.env.NODE_ENV === 'development'

/**
 * 生成多页面配置中每个页面的配置
 * @param {object} entry - 入口js
 * @param {string} template - html文件位置
 * @param {string} name - html文件输出名字以及输出位置(输出在哪个文件夹中)
 * @param {boolean} hash - 同htmlwebpackpluginhash
 * @param {boolean} inject - script注入位置默认为true 如果传入对象则为thymeleaf@{}语法特殊需求
 * @param {object} chunks - 页面依赖
 */
const generatePage = function ({
  entry = {},
  template = '',
  name = '',
  hash = true,
  inject = true,
  chunks = []
} = {}) {
  return {
    entry,
    plugins: [
      new HtmlWebpackPlugin({
        chunks,
        template,
        inject,
        hash,
        filename: name + '.html'
      })
    ]
  }
}

const pages = []
/*
  entries格式示例
  [{ account:
    { js: 'src/pages/account/js/account.js',
      html: 'src/pages/account/account.html',
      outputPath: 'account',
      htmlPath: 'account' },
    player:
    { js: 'src/pages/player/js/player.js',
      html: 'src/pages/player/player.html',
      outputPath: 'player',
      htmlPath: 'player' } }]
*/
for (let key in entries) {
  let filename = entries[key]
  if (filename === 'webTest') {
    continue
  }
  let js = filename.js
  let html = filename.html
  let outputPath = filename.outputPath
  let htmlPath = filename.htmlPath

  let data = {
    entry: {},
    inject: {},
    template: '',
    name: '',
    chunks: []
  }

  data.entry[htmlPath] = [resolve(js)] // 每个页面输出的entry名 为其html文件名
  // data.inject = {
  //   path: ''
  // }
  data.inject = true // 暂时不需要更改script为thymeleaf 语法
  data.template = resolve(html)
  data.name = `${outputPath}${htmlPath}` // 每个页面输出的html名称以及文件夹位置 为其输入html文件名和其所在文件夹名
  data.chunks = ['vender', htmlPath]
  if (isDev) {
    data.entry[htmlPath].push(hotMiddlewareScript)
    data.inject = true
  }
  pages.push(
    generatePage(data)
  )
}

module.exports = pages
