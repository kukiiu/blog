---
date: 2019-12-27
tag: 
  - webpack
author: kukiiu
location: ShenZhen
---

# 调试

## 为什么要调试
webpack源码写的还是比较绕，各种回调，递归和异步跳来跳去，刚开始跟代码时容易迷失方向。console.log在处理复杂流程就稍显薄弱，调试简单的代码还行，但是遇到各种异步方法和递归调用时，只通过log打印出来的东西很难看得懂。看代码时有时候需要我们深入到各个子流程中，有时候又要忽略细节只看整体，所以灵活使用调试工具显得尤为重要。当然，必要的console.log也是需要的，需要我们根据情况选择合适的工具。

这里我们使用vscode自带的调试工具来跟踪代码，基本上只需简单配置开箱即用，非常容易上手，基础的断点功能可以很好地让代码执行过程掌控在自己手中，调用堆栈功能可以帮助我们保留上下文环境，变量查看功能配合堆栈可以让我们随时在各个调用切换，接下来我们先熟悉这几个功能的使用。

## 跑起来demo.js
在侧边栏一个小虫子的图标就是调试面板，底部调试控制台终端可以输出调试信息，运行代码可以从调试面板启动。（图片.jpg）

首先创建一个工程文件夹`debugger`，在根目录创建`demo.js`文件，很简单仅仅将启动命令参数打印出来
```js
// demo.js
function printArgv() {
    console.log(process.argv);
}
printArgv()
```

接下来在根目录下新建`.vscode`文件夹，然后创建`launch.json`文件（这一步可以让vscode自动生成）
```json
// launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "skipFiles": [ "<node_internals>/**" ],
            "program": "${workspaceFolder}/demo.js",
            "args": ["-o", "bundle.js"]
        }
    ]
}
```

配置非常简单，创建完成后就可以在调试面板点击启动程序按钮，成功则会在调试控制台中打印类似下面的语句
> `Array(4) ["/usr/local/bin/node", "~/Desktop/debugger/demo.js", "-o",  "bundle.js"]`

## 基础操作
现在我们在`demo.js`处打上断点，直接在行号前打上红点就行。启动运行（F5），我们会看到代码会停在`printArgv()`这行，同时左侧的调试面板内容也丰富起来。
```js
// demo.js
    function printArgv() {
        console.log(process.argv); // 断点
    }
    this.count = 9
    printArgv() // 断点
```
首先看看 **变量** 一栏，这里展示了环境上下文的所有可用变量，是最主要的调试功能之一，非常简单直观，在接下来使用过程中会反复使用到这里的内容：
- **Local** 为当前上下文环境，里面有常见的**this**对象及自定义的**printArgv**函数等，另外将鼠标移动到代码处可以快速浏览到对应的变量详情。
- **Global** 则是全局上下文，里面常见的有**global**对象及**eval**函数等。 

## 调用堆栈
程序任务运行是由一组函数相互调用来完成的，调用堆栈就记录了其中的调用关系。一个函数调用另一个函数产生入栈操作，最顶层的函数就是当前运行的函数。顶层的函数执行结束后回到调用函数产生出栈操作。

点击 **单步调试** 按钮（F11），代码会继续向下执行到`console.log(process.argv);`一行，此时查看 **调用堆栈** 面板，会看到最顶层显示的就是*printArgv*，就是当前运行的函数，另外会显示*demo.js 2:5*，即当前运行在了demo文件的第2行，同时在 **变量** 面板中也显示这当前栈的上下文。

接着看第二行`(anonymous function)  demo.js 5:1`，由调用栈可知程序是在demo.js的第5行调用了printArgv函数，其中(anonymous function)意思是这个函数是匿名函数，就是说明了我们写的demo.js是运行在一个匿名函数中。

我们点击调用堆栈面板的第二行，可以看到编辑器退回到了调用printArgv()的位置并用绿色高亮，同时可以看到变量面板中的上下文变量也切换到了当前行的上下文。这个提供给我们回溯运行环境的功能非常强大，在调用栈非常深时候特别有用，可以很方便回头看看前面的内容。

## skipFiles
在调用堆栈我们还可以看到有`显示另外8个：只读核心模块(skipped by 'skipFiles')`的信息，在launch.json我们配置了一项`"skipFiles": [ "<node_internals>/**" ]`，这里我们告诉调试器将node的核心代码隐藏起来，我们不关心node是怎么启动的，console.log是调用的哪个底层代码来运行的，所以增加了这个配置项忽略掉对我们帮助不大的调用栈，最重要的是在点击 **单步调试** 时，代码不会走到忽略掉的文件里，大大方便了我们的调试。

接下来我们新建一个文件`print_util.js`来测试忽略文件，同时在launch.json的`skipFiles`里添加多一项`${workspaceFolder}/print_util.js`
```js
// print_util.js
function printArgv() {
    console.log(process.argv); // 断点
}
module.exports = printArgv

// demo.js
const printArgv = require('./print_util')
printArgv() // 断点
```
运行程序可以发现代码不会走到`print_util.js`文件中，同时断点面板也不会显示该文件里的断点。

## eval 和 已载入的脚本
js运行时除了直接执行我们写好了的js文件，另外也可以通过eval()来执行字符串代码。
```js
// demo.js
function printArgv() {
    eval('console.log(process.argv);') // 断点
}
printArgv() // 断点
```
调试执行上面的语句，连续执行2次 **单步调试** 后，我们会看到控制台并没有打印并正常结束，而是在调用堆栈里出现了另外一个匿名函数，这个匿名函数的位置是在`VMxxx 1:1`中。

在执行到eval函数时，虚拟机会"创建"出一个js文件，文件内容就是传入eval的参数，由于是个js文件就以匿名函数执行。

在**已载入的脚本**面板中，我们可以看到有三个内容：`demo.js`,`<eval>`和`<node_internals>`，其中的eval项里我们可以找到虚拟机给"创建"的文件，打开可以看到就是传入的参数`console.log(process.argv);`。

## 异步调用
首先添加'neo-async'依赖`yarn add neo-async`
```js
// demo.js
const async = require('neo-async')
var tasks = [
    function(done) {
        console.log('task1 run') // 断点1
        setTimeout(function() {
            done(null, 'task1'); // 断点2
        }, 1000);
    },
    function(done) {
        console.log('task2 run') // 断点3
        setTimeout(function() {
            done(null, 'task2'); // 断点4
        }, 2000);
    },
];
console.time('task')
async.parallel(tasks, function(err, res) { // 断点5
  console.timeEnd('task')
  console.log(res); // 断点6
});
```
执行后控制台打印如下：
```
task1 run
task2 run
[ 'task1', 'task2' ]
task: 2003.954ms
```
parallel会同时执行两个任务task1和task2，并在任务里面开启了两个延时任务，最后等2秒所有任务执行完后通过回掉打印出结果。

为了不进入neo-async代码实现里,将node_modules文件夹添加到skipFiles里：`"${workspaceFolder}/node_modules/**"`。接着运行调试，运行顺序如下：
- node核心运行（忽略）
- demo.js以匿名函数执行
- async.parallel执行（忽略）
- task1的console.log()
- task2的console.log()
- node核心Timer运行，等待1秒（忽略）
- task1.done
- node核心Timer运行，等待1秒（忽略）
- task2.done
- async.callback执行（忽略）
- tasks回调执行

以上操作可以让我们清晰看到整个异步函数的运行流程。如果去掉上面的skipFiles，调试过程中就会进到async源码中，容易干扰我们的分析。如果没有在最后的回调中打断点，那么点下一步调试器是不会进入到最后的回调去，会直接结束。所以异步函数断点打在哪里需要大家根据实际情况，根据你要关注的源码重点进行分析。

## 调试webpack
了解了如何使用调试，是为了更好的帮助我们跟踪源码，下面以webpack源码来看如何运用调试工具帮助我们理清顺序

1. 从github clone webpack源码，并切换到 *webpack-4* tag下，

2. 用`yarn install`安装依赖

3. 添加vscode调试环境 **launch.json**，修改配置项`program`为`"${workspaceFolder}/bin/webpack.js"`，使用该文件作为启动文件。

4. 修改`/node_module/webpack_cli/bin/cli.js`第267行。因为webpack使用cli作为启动器，cli又是node_modules依赖包，所以cli最后运行的是node_modules下的webpack库，现在想让cli运行clone下来的webpack库，所以强行更改依赖关系，如果有更好方法可以改进。
```js
- const webpack = require("webpack");
+ const webpack = require("../../../lib/webpack");
```

5. 在/bin/webpack.js第一行添加断点,运行调试 

### 注意事项
- **调用堆栈**：在webpack代码中函数递归回调层层嵌套，有时候跟着跟着就忘了前面是从哪里进来的，这时候翻一翻调用栈就可以很方便找到回忆。
- **skipFiles**：在webpack里引用了大量第三方库，有时候我们想要跟到这些库里看看细节，有时候对细节清楚了又想快速跳过，这时候灵活配置这个参数就可以非常方便我们控制调试的节奏。
- **eval**：在webpack中的核心类Tapable中大量使用了eval方法，了解这一点后面在调用堆栈中看到相关内容就不会在迷惑了。
- **异步调用**：在webpack大量使用了async，所以了解异步方法运行流程和调试方法，同时配合skipFiles将不关心的分支流程忽略调，才不容易被源码给绕晕。
