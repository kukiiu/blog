# 【未完成】异步工具 async / neo-async
**[neo-async](https://github.com/suguru03/neo-async)** 是 **[async](https://github.com/caolan/async)** 库的一个替代品，说是在基准测试neo-async要快，其他功能都和async一样。它提供了许多工具帮助我们更优雅的处理流程控制。整个库包含了三大部分：
- Collections： 集合操作，包括常见的map，each，filter等
- ControlFlow： 控制流，常见的parallel，series，waterfall等
- Utils：小工具，TODO 没研究是干嘛

# 集合工具
## each / eachLimit / eachSeries / eachOf / eachOfLimit / eachOfSeries
each的作用就是将集合元素逐个同步开启，任务可以并行执行，eachSeries限制并发数为1， eachLimit可自定义并发数。eachOf和each区别在于执行回调的第二个参数传了当前执行任务的key。实现方式比较简单，只是用各个元素逐个执行回调，中间加了写函数异步化和迭代器生成等处理，如果有出错不继续执行后面。

## 其他
其他函数功能大同小异，都是对集合中每个元素进行处理，区别主要在输出的结构。

# 控制流工具
## 顺序执行任务 - series
series将所有任务顺序地执行，执行。。。

# 工具
## awaitify
传统的node异步函数调用都会使用callback作为最后一个参数，nodejs通过回掉的方式来实现异步结果通知。但是带来的问题就是回调的层层嵌套，而后后推出的Promise和async/await便是解决这个问题的理想方法，callback类型的异步函数可以通过Promise实现链式回调，async/await进一步将Promise同步化，最终实现了将层层回调的代码转为同步代码。

和node内置的`util.promisify`类似，awaitify就是将异步函数包装成Promise函数。

## asyncify
该方法主要将函数调用方式包装为异步调用形式，即最后一个参数为回调的形式。在以Promise和async基础上回调如果有异常，将会使用setImmediate放到本循环最后抛异常，同样是为了保持和异步调用错误处理一致，让你没办法在调用后catch住异常。
> 在源码中判断是否是async函数是用原型AsyncFunction来判断，判断是否为Promise则是通过是否有then函数来判断。
```js
// 将同步函数转换为异步传参形式
function add(arg1, arg2) {
    return arg1 + arg2
}
// 将Promise转化为异步传参形式
function add(arg1, arg2) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(arg1 + arg2)
        }, 1000);
    })
}
// 将async转换为异步传参形式
async function add(arg1, arg2) {
    return arg1 + arg2
}
// 以异步方式调用
const addAsync = async.asyncify(add)
addAsync(1, 3, (err, res) => {
    console.log(res)
})
//.catch(e => console.error(e)); callback如果抛异常这里抓不住
```

## ensureAsync
将入参函数包装成必定延迟执行函数。延迟执行函数是调用后不立即执行回调，而是在后面某个周期执行。源码使用以下可用方法`setImmediate || process.nextTick || setTimeout(fn, 0)`保证延时，如果是async函数默认延时。
```js
function sometimesAsync(arg, callback) {
    if (cache[arg]) {
        return callback(null, cache[arg]); // this would be synchronous!!
    } else {
        doSomeIO(arg, callback); // this IO would be asynchronous
    }
}
    // this has a risk of stack overflows if many results are cached in a row
    async.mapSeries(args, sometimesAsync, done);

    // this will defer sometimesAsync's callback if necessary,
    // preventing stack overflows
    async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 ```
代码中的这个注释意思是说回调有可能以同步方式执行，这样有可能会导致栈溢出异常。这个漏洞目前已经被补上，虽然注释还在这里没删掉，所以现在的版本不用ensureAsync也不会有问题。

造成栈溢出的原因是在同步执行回调后，会立即继续执行下一个元素调用，如果同步调用次数多，调用栈会越来越深，最终栈溢出。如果使用延时函数包装，调用栈不会叠加。下面我们看看源码修复的位置，尝试还原这个问题，然后我们写个代码模拟栈溢出：（git commit id: cd6beba687bec8112357ff72b6a610cf245590cd）：
```js
// eachOfLimit.js
// ...
// var looping = false;
// ...
//  else if (!looping) {
//     replenish();
// }
else {
    replenish();
}
// looping = true;
// looping = false;
```
```js
// index.js
const async = require("./dist/async")
const fs = require('fs')
let buffer = Buffer.alloc(10, 1);
let i = 0
const cache = {}
function sometimesAsync(arg, callback) {
    if(cache[arg]) {
        if(i++ %1000 === 0) {
            console.trace()
        }
        return callback(null);
    } else {
        fs.writeFile(arg,buffer, (err, res) => {
            cache[arg] = true
            callback(null)
        });
    }
}

async.mapSeries(
    new Array(10000).fill('./data'),
    // async.ensureAsync(sometimesAsync), 
    sometimesAsync,
    (err, res) => {
        console.log(cache)
    }
);
```
命令行执行 `node --stack_trace_limit=50 index.js`
```
// sometimesAsync 执行结果：
Trace
    at sometimesAsync (/.../index.js:25:21)
    at eachfn (/.../async/dist/async.js:247:13)
    at replenish (/.../async/dist/async.js:447:21)
    at iterateeCallback (/.../async/dist/async.js:431:21)
    at /.../async/dist/async.js:325:20
    at _iteratee (/.../async/dist/async.js:249:17)
    at sometimesAsync (/.../index.js:28:16)
    at eachfn (/.../async/dist/async.js:247:13)
    at replenish (/.../async/dist/async.js:447:21)
    at iterateeCallback (/.../async/dist/async.js:431:21)
    at /.../async/dist/async.js:325:20
    at _iteratee (/.../async/dist/async.js:249:17)
    at sometimesAsync (/.../index.js:28:16)
    at eachfn (/.../async/dist/async.js:247:13)
    at replenish (/.../async/dist/async.js:447:21)
    at iterateeCallback (/.../async/dist/async.js:431:21)
    at /.../async/dist/async.js:325:20
    ...

// async.ensureAsync(sometimesAsync)执行结果
Trace
    at sometimesAsync (/.../index.js:25:21)
    at /.../async/dist/async.js:2329:16
    at eachfn (/.../async/dist/async.js:247:13)
    at replenish (/.../async/dist/async.js:447:21)
    at iterateeCallback (/.../async/dist/async.js:431:21)
    at /.../async/dist/async.js:325:20
    at _iteratee (/.../async/dist/async.js:249:17)
    at setImmediate$1 (/.../async/dist/async.js:2324:42)
    at Immediate.defer [as _onImmediate] (/.../async/dist/async.js:73:45)
    at runCallback (timers.js:705:18)
    at tryOnImmediate (timers.js:676:5)
    at processImmediate (timers.js:658:5)
```
在写回调函数时，我们应当遵循如果是延时回调，那么所有的出口都应该是延时处理，如果是同步回调，那么所有的出口都应该是同步的，不应该像上面的`sometimesAsync`即有可能同步执行回调，又有可能延时执行回调。

# 源码细节

```js
/**
    * An "async function" in the context of Async is an asynchronous function with
    * a variable number of parameters, with the final parameter being a callback.
    * (`function (arg1, arg2, ..., callback) {}`)
    * The final callback is of the form `callback(err, results...)`, which must be
    * called once the function is completed.  The callback should be called with a
    * Error as its first argument to signal that an error occurred.
    * Otherwise, if no error occurred, it should be called with `null` as the first
    * argument, and any additional `result` arguments that may apply, to signal
    * successful completion.
    * The callback must be called exactly once, ideally on a later tick of the
    * JavaScript event loop.
    *
    * This type of function is also referred to as a "Node-style async function",
    * or a "continuation passing-style function" (CPS). Most of the methods of this
    * library are themselves CPS/Node-style async functions, or functions that
    * return CPS/Node-style async functions.
    *
    * Wherever we accept a Node-style async function, we also directly accept an
    * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
    * In this case, the `async` function will not be passed a final callback
    * argument, and any thrown error will be used as the `err` argument of the
    * implicit callback, and the return value will be used as the `result` value.
    * (i.e. a `rejected` of the returned Promise becomes the `err` callback
    * argument, and a `resolved` value becomes the `result`.)
    *
    * Note, due to JavaScript limitations, we can only detect native `async`
    * functions and not transpilied implementations.
    * Your environment must have `async`/`await` support for this to work.
    * (e.g. Node > v7.6, or a recent version of a modern browser).
    * If you are using `async` functions through a transpiler (e.g. Babel), you
    * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
    * because the `async function` will be compiled to an ordinary function that
    * returns a promise.
    *
    */
```

## setImmediate
`defer = setImmediate || process.nextTick || setTimeout(fn, 0)`
`(fn, ...args) => defer(() => fn(...args));`

## 源码实现
webpack4中使用的是`^2.6.1`版本代码，
asyncLib.parallel
asyncLib.forEach
asyncLib.forEachLimit
asyncLib.map
asyncLib.eachSeries

## Webpack使用
在webpack中的几个关键的流程用到了这个异步工具库，如Compilation使用了`forEach`来解析模块依赖，NormalModuleFactory使用`parallel`来执行loader，Compiler使用`forEachLimit`解析输出等。由于都是异步操作，不懂原理直接看源码容易懵逼，所以有必要详细了解下这个库的内容。


## 参考资料
[async库文档链接](https://caolan.github.io/async/v3/)