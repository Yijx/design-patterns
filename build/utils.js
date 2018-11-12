const glob = require('glob')
const figlet = require('figlet')
let specifyPages = process.argv.slice(6) // 通过命令行传入的单独打包参数

if (specifyPages.length > 0) {
  let html = ''
  for (let item of specifyPages) {
    html += item + ' '
  }
  figlet('BUILD ' + html, (err, data) => {
    if (err) {
      console.log('Something went wrong...')
      console.dir(err)
      return
    }
    console.log(data)
  })
} else {
  figlet('BUILD ALL PAGES', (err, data) => {
    if (err) {
      console.log('Something went wrong...')
      console.dir(err)
      return
    }
    console.log(data)
  })
}

let getEntries = (htmlPath, specifyPages) => {
  // 获取所有匹配html的文件名数组
  let html = glob.sync(htmlPath)
  let entries = {}
  for (let item of html) { // 拿到html路径 eg. src/pages/account/login.html
    let arr = item.split('/')
    let fileName = arr[2] // 拿到文件夹的名字 eg. account
    let htmlName = arr[arr.length - 1].split('.')[0] // 拿到html文件的名字 eg. login
    let outputName = fileName // 输出在dist目录中的位置 默认名字和文件名一样 eg. account
    /*
      原文件目录account/account(login).html默认情况下输出在dist目录下 为account/account(login).html 后者为html名与文件夹名不同情况
      如果自定义account/account-login.html 则输出在dist目录下 login/account.html
    */
    if (htmlName.split('-').length !== 1) {
      let oldHtmlName = htmlName.split('-')
      htmlName = oldHtmlName[0]
      outputName = oldHtmlName[1]
      if (outputName === 'root') {
        outputName = ''
      }
    }
    // 如果指定页面 添加过滤
    if (specifyPages && specifyPages.length !== 0) {
      if (!specifyPages.includes(htmlName)) {
        continue
      }
    }
    entries[htmlName] = {
      js: `src/pages/${fileName}/js/${htmlName}.js`, // js文件目录
      html: `${item}`, // html文件目录
      outputPath: outputName ? outputName + '/' : outputName, // 输出在dist目录中的位置 默认名字和文件名一样 eg. account
      htmlPath: htmlName // html文件夹的名字
    }
  }

  return entries
}

const entries = getEntries('src/pages/*/*.html', specifyPages)

module.exports = entries
