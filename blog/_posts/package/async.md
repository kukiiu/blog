# 异步工具 async / neo-async

异步工具库async提供了许多工具帮助我们更优雅的处理流程控制，即任务执行顺序和控制调用时机。整个库包含了三大部分：
- Collections：集合操作
- ControlFlow：控制流
- Utils：小工具

# Collections：集合操作（map，each，filter）
集合工具即是将某个集合的所有元素按一定规则进行处理，是流程控制的基础。

## each系列
each的作用就是将集合元素逐个同步开启，任务可以并行执行，eachSeries限制并发数为1， eachLimit可自定义并发数。eachOf和each区别在于执行回调的第二个参数传了当前执行任务的key。实现方式比较简单，只是用各个元素逐个执行回调，中间加了写函数异步化和迭代器生成等处理，如果有出错不继续执行后面。

eachOfLimit是其他方法的基础，大部分函数都会在底层用到。首先将集合封装成迭代器，然后逐个执行任务，开启任务前和任务结束回调后做限流控制。

## 其他
其他函数功能大同小异，都是对集合中每个元素进行处理，区别主要在输出的结构。


# ControlFlow：控制流（parallel，series，waterfall）
流程控制即是控制任务的流转过程，任务通常以表现为一个特定函数。

## 同步开启任务（applyEach / parallel / times / sortBy / race）
他们都将同步开启所有任务，区别在于使用方式不同而已。和each不同在于他们是特定参数作用于所有任务，each是所有参数作用于指定函数。

## 顺序执行任务（series / xxxSeries / waterfall / retry / forever）
series将所有任务顺序地同步执行，内部实现是单任务的parallel。waterfall则是将上个任务结果传给下个任务。

## 条件执行任务（whilst / until / tryEach）
whilst和until类似while循环，达到某个条件后才结束任务触发。tryEach只要有任务成功就返回

## 基于依赖顺序开启任务（auto / autoInject）
任务依赖先根据卡恩算法判断是否存在循环依赖，然后同步开启任务。auto使用字符串声明依赖，autoInject使用函数参数声明依赖（利用正则匹配出参数列表）。
```js
// 解析函数参数，自动注入参数
function parseParams(func) {
    // 函数转换成字符串，去除注释
    const src = func.toString().replace(STRIP_COMMENTS, '');
    // 匹配普通函数参数/箭头函数参数
    let match = src.match(FN_ARGS) || src.match(ARROW_FN_ARGS);
    if (!match) throw new Error('could not parse args in autoInject\nSource:\n' + src)
    /// ...
}
```

## 动态添加任务（queue / priorityQueue）
任务队列是基于双向列表来存储，初始化队列就生成任务队列。然后可添加相应的事件监听方法，事件会在相应的时间点触发。添加任务即执行任务。

任务队列使用双向列表可快速在任意位置添加删除元素，任务队列也提供了头部添加任务方法`unshift/unshiftAsync`和尾部添加任务方法`push/pushAsync`，还提供了删除任意任务方法`remove`。链表内部实现了遍历方法`Symbol.iterator`，可以用for...of或...方法来遍历链表内容。
* concurrency：任务处理并发数，可动态修改。
* payload：每个次可以处理的任务数，如果payload为n，那么传入到执行函数的任务数量最多为n。
* started：是否开启任务处理，只要往队列中添加元素，就设置为true。
* pause：是否暂停任务处理。
* idle：队列是否空闲，当任务队列和当前处理队列为空时，队列状态为空闲。
* running：当前正在处理的任务数量。
* workersList：当前正在处理的任务列表。
* length：当前还未处理的任务队列长度。

事件是非必须的，可以用于动态改变队列属性，也可以在事件触发阶段执行业务。代码使用发布/订阅模式处理事件，在初始化队列时可以添加事件订阅，事件函数会在运行的各个阶段触发。
- error：执行失败时触发。
- drain：任务队列执行完触发。
- saturated: 任务饱和时触发，当前处理任务列表长度和并发数相等。
- unsaturated: 任务未饱和时触发，当前处理任务列表长度小于并发数。
- empty: 待处理列表为空时触发。

添加任务是主要方法，首先在数据加入队列前包装回调，这里是为了兼容异步promise回调方式，接着将任务插入队列。紧接着使用了setImmediate延时执行开启任务，并做了性能优化，多次同步添加任务只会开启一次。如果当前状态允许执行任务，则将任务传到工作函数，工作函数执行完后执行回调。最后在回调时又会立即开启任务继续循环。

# Utils：小工具

## setImmediate - 延时函数
下面的函数都可以执行后立即返回，等事件循环调度延迟执行，不同点在于调度时机不同。`defer = setImmediate || process.nextTick || setTimeout(fn, 0)`
`(fn, ...args) => defer(() => fn(...args));`

## awaitify
和node内置的`util.promisify`类似，awaitify就是将最后一个参数不是callback的函数包装成Promise函数。

传统的node异步函数调用都会使用callback作为最后一个参数，nodejs通过回掉的方式来实现异步结果通知。但是带来的问题就是回调的层层嵌套，而后后推出的Promise和async/await便是解决这个问题的理想方法，callback类型的异步函数可以通过Promise实现链式回调，async/await进一步将Promise同步化，最终实现了将层层回调的代码转为同步代码。

## isAsync
可以用该判断一个函数是否是以ES6的async方式定义的
> 判断是否为Promise则是通过是否有then函数来判断。
```js
function isAsync(fn) {
    return fn[Symbol.toStringTag] === 'AsyncFunction';
}
```

## asyncify
该方法主要将函数调用方式包装为异步调用形式，即最后一个参数为回调的形式。

在这个库使用的函数除了是‘Node风格的异步函数’外，还可以接受ES6的async函数。但是他不需要传callback，所以输出方式有所不同，所以使用这个方法来屏蔽相关的差异。

> Node风格的异步函数：是指函数参数最后以callback函数为结尾(`function (arg1, arg2, ..., callback) {}`)，callback一个参数是代表执行过程中的错误信息，callback需要在执行完成后调用，理想状况下是在本次事件循环结束前调用。

在以Promise和async基础上回调如果有异常，将会使用setImmediate放到本循环最后抛异常，同样是为了保持和异步调用错误处理一致，让你没办法在调用后catch住异常。
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

## ensureAsync - 回调引发的栈溢出

该函数作用就是将入参函数包装成必定延迟执行函数。延迟执行函数是调用后不立即执行回调，而是在后面某个周期执行。利用同步函数立即执行回调的特性判断包装函数执行时是否以同步方式运行，如果是同步运行则使用`setImmediate`保证延时

> ES6的async函数默认是延时执行

下面这段代码在旧版本的库中会造成栈溢出，原因是在同步执行回调后，会立即继续执行下一个元素调用，如果同步调用次数多，调用栈会越来越深，最终栈溢出。
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
        return callback(null); // 同步
    } else {
        fs.writeFile(arg,buffer, (err, res) => {
            cache[arg] = true
            callback(null) // 异步
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
这个漏洞目前已经被补上，下面我们看看源码修复的位置，尝试还原这个问题，然后我们执行代码看看栈溢出结果（commitId: cd6beba687bec8112357ff72b6a610cf245590cd）：
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
可以看到如果回调一直是以同步方式运行，调用栈就会不断增加，最终报栈溢出异常。如果使用`ensureAsync`包裹，则调用多少次都不会栈溢出。

在写回调函数时，我们应当遵循如果是延时回调，那么所有的出口都应该是延时处理，如果是同步回调，那么所有的出口都应该是同步的，不应该像上面的`sometimesAsync`即有可能同步执行回调，又有可能延时执行回调。

# 参考资料
[nodejs的异步流程](https://github.com/kukiiu/blog/blob/master/blog/_posts/node/nodejs%E7%9A%84%E5%BC%82%E6%AD%A5%E6%B5%81%E7%A8%8B.md)

[async github](https://github.com/caolan/async)

[async库文档链接](https://caolan.github.io/async/v3/)

[neo-async github](https://github.com/suguru03/neo-async)

[designing-apis-for-asynchrony](https://blog.izs.me/2013/08/designing-apis-for-asynchrony)

