# 内存文件系统 memory-fs / memfs
内存文件系统是在内存中模拟一个磁盘操作系统，因为读取磁盘速度比读取内存慢得多，所以在需要频繁读写文件场景下，我们可以使用内存文件系统做为存储介质。例如在webpack中，开发环境下就是将打包出来的bundle写如内存中实现快速存取。

# 实现一个内存文件系统
## 需求分析
文件系统最重要的肯定是目录和文件的增删改查啦，我们就先实现这几个常用的功能，有其他需求后面再迭代：
- 创建/删除/文件夹
- 写入/读取文件
- 获取文件夹/文件信息

## 系统分析
### 文件系统怎样存放
文件系统最重要的就是内容读写了，既然是放在内存，那么我们可以用一个变量来承载整个系统。

### 目录怎样组织
接下来看看目录要怎么存储，一个常见的目录形式是这样`/user/tmp/dir`，我们可以看到从根目录`/`开始，目录结构程树形扩展。如果一个目录使用对象来表示，其子目录使用目录名作为key挂在上级目录属性上，就可以很方便地模拟出目录结构。

### 文件怎样组织
然后是文件要怎么存储，最简单的方法就是使用对象表示文件，和目录一样，所以这里我们就需要给目录一个标志区分目录和文件。

## 实现
```js
class MemoryFileSystem {
    constructor() {
        // 存储目录和文件
        this.data = {   // 根目录
            _MEMORY_FILE_SYSTEM_DIR_FLAG: true,
            'tmp': {    // /tmp 目录
                _MEMORY_FILE_SYSTEM_DIR_FLAG: true,
                'package.txt': { foo: 'bar' } // 文件
            }
            'text.txt': 'i am file'   // 文件
        }
    }
    readFile(path) {
        // ...
    }
    writeFile(path, content) {
        // ...
    }
}
```

# 加需求
## 需要能够以流的方式操作文件
使用文件流的方式可以和任何标准的Stream连接实现管道操作，比如读取文件后发送到网络，可以看成数据在两个管道中流过，从文件流读取，输出到网络流。

我们可以借助node自带的`stream`来实现内存系统的文件流。这里我们创建一个写文件流，覆盖他的写方法`_write`。当我们调用`stream.write`时，内部会调用`_write`执行我们真正的写入操作，`chunk`就是我们需要写入的数据，此时将它写入到我们自己实现的内存文件中就行了。

> `memory-fs`使用`readable-stream`库来替代node自带的`Stream`，主要是为了保持不同版本node在Stream的表现一致。

```js
var WritableStream = require('stream').Writable;
createWriteStream(path) {
    let stream = new WritableStream();
    let bl = [ ], len = 0;
    stream._write = (chunk, encoding, callback) => {
        bl.push(chunk);
        len += chunk.length;
        this.writeFile(path, Buffer.concat(bl, len), callback);
    }
    return stream;
}
```

现在我们可以将控制台输入到内存文件系统，只要通过管道`pipe`连接控制台输入流和内存文件输出流，输入内容就会从控制台'流'到内存里：
```js
const reader = fs.createWriteStream("/tmp/file.txt")
process.stdin.pipe(reader)
process.stdin.on('data',(input)=>{
    console.log('input is: ', input.toString())
    console.log('file is: ', fs.tmp['file.txt'])
})
```

## 限制文件内容只能存二进制数据
由NodejsAPI创建的流都是用`string`或`Buffer`流来包装数据。当然如果需要传输普通js对象，也可以在创建流时指定使用`Object Mode`。这里我们将内存文件系统中存储的数据转换为`Buffer`，以保持统一。
```js
writeFile(_path, content) {
    const path = pathToArray(_path);
    let current = this.data;
    for(let i = 0; i < path.length - 1; i++) {
        if(!isDir(current[path[i]])) throw new Error()
        current = current[path[i]];
    }
    current[path[path.length - 1]] = new Buffer(content);
    return;
}
```

# memfs 的实现方式
上面的代码就是简单版本的内存文件系统，`memory-fs`的实现思路类似。另外一个内存文件系统库`memfs`是模拟真实文件系统，它在内存中维护了一系列的Node,Link等，且提供了完整的文件操作功能，但实现方式大同小异，有兴趣可以学习学习。

一个比较有意思的功能是它提供了修改`require`来执行内存文件系统里存的文件：
```js
const fs = require('./lib/index')
const monkey = require('fs-monkey')
// 向内存中写入js文件
fs.writeFileSync('/index.js', 'console.log("hello world")');
// 修改require默认实现
monkey.patchRequire(fs);
// 执行加载
require('/index'); // hello world
```
我们知道node使用`require`来加载模块，如果我们修改了加载器的实现，就可以实现加载执行我们自己的文件系统内容，下面简单模拟实现：
```js
// 引入node模块管理包
const Module = require('module')
// 重写查找文件方法
Module._findPath = function (request, paths, isMain) {
  // 可以从内存文件系统查找文件
  return 'index.js'
}
// 重写文件执行方法
Module._extensions['.js'] = function (module, filename) {
  // 可以从内存文件系统加载内容
  var content = 'console.log("hello world")'
  // 执行代码
  module._compile(content, filename);
};
// 引入执行
require('/index') // hello world
```

# 参考资料
[Node Stream](https://nodejs.org/api/stream.htmls)

[why-i-dont-use-nodes-core-stream-module](https://r.va.gg/2014/06/why-i-dont-use-nodes-core-stream-module.html)

[memory-fs](https://github.com/webpack/memory-fs)

[memfs](https://github.com/streamich/memfs)