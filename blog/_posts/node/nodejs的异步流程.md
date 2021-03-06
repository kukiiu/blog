# nodejs的异步流程
```js
let path = 'test.txt'
let data = readFile(path)
data = data + 'new word'
writeFile(path, data)
```
通常情况下，我们最希望程序能一步步按顺序的执行，这和我们的思维方式一致。在最开始学习编程时，我们也是先了解的结构化程序设计，通过顺序结构、分支结构和循环结构组织代码，这样的代码流程最清晰。

但遗憾的是现实是残酷的，文件操作、网络操作等都是执行速度慢的操作。如果只是顺序执行，那么在执行到这些地方时将会被卡住。大部分情况下我们只是想要这个操作的结果，等到需要用到数据时再取出使用。异步则是处理这个问题的方式。

# 什么是异步
将复杂耗时的过程封装成能够立即从主流程返回，只在获取到结果后通知主流程继续处理的过程，就是异步化。调用者发起一个异步操作，然后立即返回去做别的事，异步操作通过状态、回调等手段来通知调用者。所以异步函数通常有以下特点：
- 异步函数立即返回不阻塞调用者
- 调用者能通过某种机制得到异步函数执行结果

# nodejs的异步操作-文件读取
nodejs的读取文件操作`fs.readFile(path[, options], callback)`是异步操作，在执行程序后立即返回，通过回调机制通知代码获取结果。
```js
let fs = require("fs");
fs.readFile('input.txt', function (err, data) {
    if (err) { return console.error(err); }
    console.log(data.toString());
});
console.log('finish')
```
上面是一个最常见的node文件读取方法，由于读取文件速度是慢操作，如果读取文件是同步的，那么后面的流程将会在这段时间卡住。给文件读取添加一个回调，让下面的流程不用等文件读取结束先执行，等文件读取完成后执行回调里的任务，最后结束任务。这里的文件读取函数就是非阻塞的，文件读取完成后执行的回调是异步操作。

> nodejs也提供了同步文件操作readFileSync，最常见用在了依赖管理（CommonJS）的require中，这里面读取文件用的就是同步操作，但是node整体的风格还是异步的。

# 同步调用转换为异步调用
在处理CPU密集型（图片处理，加解密，复杂算法）等操作时，如果直接在代码中运行有可能出现主流程暂时卡住情况，有没有办法将他们转换为异步函数呢？

## setTimeout
先看看setTimeout，它本身是异步操作。在调用setTimeout后立即返回，且经过了设定时间后，通知主流程等待完成，只不过这个异步操作的执行内容只是等待，其他什么也没做。setTimeout的异步并不是我们需要的能封装耗时操作的异步，耗时操作还是会在回调时同步地在主流程运行。
```js
console.time('main')
console.time('begin')
console.time('finish')
setTimeout(() => {
    console.timeEnd('begin')
    fs.writeFileSync('./data', buffer)
    console.timeEnd('finish')
}, 0)
console.timeEnd('main')
// main: 0.911ms
// begin: 4.230ms
// finish: 1355.096ms
```

## Promise
Promise则是一个包装器，通常用它来处理回调嵌套的问题，他也只能将异步函数封装成更易使用的异步函数，并不能将同步调用转为异步调用。在创建Promise后并不是立即返回，而是同步执行里面的回调函数。
```js
console.time('main')
console.time('begin')
console.time('finish')
new Promise((resolve) => {
    console.timeEnd('begin')
    fs.writeFileSync('./data', buffer)
    console.timeEnd('finish')
    return resolve()
})
console.timeEnd('main')
// begin: 0.332ms
// finish: 1321.230ms
// main: 1322.646ms
```

## nextTick
nextTick的执行结果和setTimeout相似，本质上也只是改变了代码的调用时机，同步操作依然是在单线程里操作，所以虽然会立即执行nextTick后面内容，但是执行同步操作依然会卡住，并不是真正意义的异步。

## 怎么做？
所以在语法层面并没有能够提供同步转异步的方法，很显然如果需要转为异步操作，需要让复杂操作不在主流程中处理，这就需要借助其他的工具来实现：
- 使用child_process或cluster来创建多进程，并在新建进程中处理。
- 使用worker_threads创建多线程，并在新线程中处理。
- 将复杂逻辑封装成api请求，使用ajax自带的异步流程来实现。

# 异步调用转换为同步调用
既然都是异步调用了，肯定是没法转为真同步的。那使用async/await不是可以将代码写成同步的吗？
```js
let fs = require('fs');
(async() => {
    let buffer = Buffer.alloc(1000000000, 1);
    function myWriteFileSync() {
        return new Promise((resolve) => {
            fs.writeFile('./data', buffer, (err, res) => {
                console.timeEnd('async')
                return resolve()
            })
        })
    }
    function rawWriteFileSync() {
        fs.writeFileSync('./data', buffer)
        console.timeEnd('sync')
    }
    setInterval(() => {
        console.log('interval...')
    }, 500);
    console.time('start')
    console.time('end')
    console.time('sync')
    console.time('async')
    console.timeEnd('start')
    await myWriteFileSync()
    rawWriteFileSync()
    console.timeEnd('end')
})()
// start: 0.157ms
// interval...
// interval...
// async: 1455.406ms
// sync: 3048.463ms
// end: 3048.795ms
// interval...
// interval...
```
以上代码我们使用了原生的同步写方法和使用async/await操作用Promise封装的异步写方法，在主线程中我们使用interval每隔500ms打印一次。结果可以看到在执行到await时，虽然没有继续往下执行，但是定时器任务还是会触发。但是如果是真正的同步操作，定时器也会被卡住不执行。所以说async/await只是个"假同步"。

# node的异步调用实现原理

## nodejs是单线程还是多线程？
```js
console.time('running')
let i = 10000000000
while(i>0) {
    i--
}
console.timeEnd('running')
// running: 11448.334ms
```
在mac电脑打开活动监视器，运行后可以看到启动了一个node进程，且该进程的线程数量大于1，同时CPU利用率飙到了97.9%。

可以看到，程序启动了一个node进程和多个线程。nodejs在设计上是单线程模型，虽然node启动会创建多个线程（垃圾回收等），但是一个node进程只会启动一个线程真正执行我们写的代码。所以我们说的nodejs是单线程指的不是指nodejs只会启动一个线程。

> 浏览器打开一个tab也是启动一个进程，进程下启动多个线程，最终处理用户js也是一个线程。

## node的异步支持
看到这里大家有没有想过，既然nodejs是单线程，那它是怎么支持异步操作的？
```js
let fs = require('fs');
let buffer = Buffer.alloc(1000000000, 1);
console.time('main')
console.time('write')
fs.writeFile('./data', buffer, (err, res) => {
    console.timeEnd('write')
})
console.timeEnd('main')
// main: 0.661ms
// write: 1291.268ms
```
上面代码执行后，由于writeFile是异步操作，所以监视器可以看到线程数量变多了，此时CPU利用率也不是很高。原来在执行到异步操作时，node会使用其他线程来处理文件写入操作，执行用户代码的线程继续往下执行，等到异步操作执行完成后，再将结果交给用户线程。接管和交回的动作是由事件循环机制实现。

nodejs是异步非阻塞模型。提到异步非阻塞，我们会想到IOCP和AIO，只有这两个是操作系统提供的最纯洁的异步非阻塞模型。那为什么说nodejs也是异步非阻塞模型，跟这两个方法有什么关系吗？

其实这只是站在不同维度得出的结论，我们说的nodejs是站在应用层面说他是异步非阻塞，将文件，网络调用等封装成了异步非阻塞操作供应用层使用。最终writeFile在node接管后是由libuv实现任务分配调度。而libuv将同步转为异步过程则是由这个库实现的多线程和操作系统I/O实现的，linux下时用的同步非阻塞epoll，window用的异步非阻塞IOCP。

## 延时函数 / 异步函数
延时函数之所以和异步函数不同，是因为延时后并不是将任务‘交出’给别人做，只是将处理任务时间往后挪了挪，最后执行任务还是调用者做。而异步是真正将任务‘交出’去，只需要有结果时把结果交回给调用者就行。

## 异步函数不一定是异步执行
既然nodejs自带的`writeFile`是异步实现的，那么如果同时调用了两次writeFile，是不是两个写入操作总时间和一个写入操作一样呢？答案肯定是否定的，上面已经说了，异步函数只是我们从应用的角度上看是异步的，但最终写操作时候还是要一个一个文件同步写入，磁盘不可能同时处理两个文件吧，所以最终在底层还是同步执行。如果上面函数换成`fetch`结果就不一样了，网络耗时操作主要是在传输和处理上，所以同时执行多个fetch和执行一个耗时差不多，看起来就是异步了。

# 参考资料
[事件循环](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

[怎样理解阻塞非阻塞与同步异步的区别？](https://www.zhihu.com/question/19732473)

[浏览器与Node的事件循环(Event Loop)有何区别?](https://www.jianshu.com/p/ca723144102b)

[Node.js 线程你理解的可能是错的](https://segmentfault.com/a/1190000015262294)

[callbacks-synchronous-and-asynchronous](https://blog.ometer.com/2011/07/24/callbacks-synchronous-and-asynchronous/)