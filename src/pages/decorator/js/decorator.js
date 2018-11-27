@testtable
class MyTestTableClass {}

function testtable (target) {
  target.isTestTable = true
}

console.log(MyTestTableClass.isTestTable)

// 利用this绑定 完成装饰者模式
let oldFunction = document.getElementById
document.getElementById = function () {
  console.log('use apply')
  oldFunction.apply(document, arguments)
}
document.getElementById('hello')
// 利用AOP(面向切面编程) 完成装饰者模式
/* eslint-disable */
Function.prototype.before = function (fn) {
  let self = this
  return function () {
    fn.apply(this, arguments)
    return self.apply(this, arguments)
  }
}

document.querySelector = document.querySelector.before(() => console.log('use aop'))
document.querySelector('#nice')

let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 }
console.log({...z})
