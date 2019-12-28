# 【未完成】Webpack用到的库 - 异步工具neo-async
在webpack中的几个关键的流程用到了这个异步工具库，如Compilation使用了`forEach`来解析模块依赖，NormalModuleFactory使用`parallel`来执行loader，Compiler使用`forEachLimit`解析输出等。由于都是异步操作，不懂原理直接看源码容易懵逼，所以有必要详细了解下这个库的内容。

## neo-async简介
**[neo-async](https://github.com/suguru03/neo-async)** 是 **[async](https://github.com/caolan/async)** 库的一个替代品，说是在基准测试neo-async要快，其他功能都和async一样。[通往详细文档链接](https://caolan.github.io/async/v3/)

整个库包含了三大部分：
- Collections： 集合操作，包括常见的map，each，filter
等
- ControlFlow： 控制流，常见的parallel，series，
waterfall等
- Utils：小工具，TODO 没研究是干嘛

### 回掉地狱

### promise/promisify

### async/await

## 源码实现
webpack4中使用的是`^2.6.1`版本代码，
asyncLib.parallel
asyncLib.forEach
asyncLib.forEachLimit
asyncLib.map
asyncLib.eachSeries

## tmp
await fs.readFile()本质上还是异步，他不会阻塞其他异步代码的执行。只会阻塞当前function内的代码。

fs.readFileSync()是同步，他会阻塞整个js线程，其他异步代码在这个方法返回之前都不能得到执行。

验证方法：准备一个大文件（读取大概要2,3秒这样子）,把setInterval(()=>{console.log(time.Now();)},100);分别放在这俩代码前面，执行看看输出。
