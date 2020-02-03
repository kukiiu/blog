# 路径解析 require.resolve
采用模块化方式编写代码让我们可以更好的组织代码结构，node在解析依赖时，首先会获取依赖的文件是否存在，即每当遇到`import`或`require`这些导入语法时，就会根据规则去找到需要解析的文件路径。

# 使用方法
在node中，可以使用require.resolve来查询某个模块的完整路径，使用方式如下：
```js
// 绝对路径 -> /Users/enhanced-resolve/lib/node.js
require.resolve('/Users/enhanced-resolve/')
// 相对路径 -> /Users/enhanced-resolve/index.js
require.resolve('./index')
// 模块路径 -> /Users/enhanced-resolve/node_modules/diff/diff.js
require.resolve('diff')
```
刚开始看到结果可能会疑惑，为什么返回结果是`node.js`？他是怎么找到node_modules下的`diff.js`？下面我们进入node的源码中看看它的执行原理。

# 执行原理
require是node在解析js时向每个文件注入的对象，最常见用法就是使用CommonJs语法引入其他js，另外node还向这个函数添加了一写功能方法，其中一个路径解析`resolve`就是我们现在要研究的方法：
```js
// node定义的函数
function resolve(request, options) {
    validateString(request, 'request');
    return Module._resolveFilename(request, mod, false, options);
}
```
在下面分析中我们只看主流程，会忽略掉一些次要功能如参数校验，缓存，和软连接等的处理

## Module._resolveFilename
```js
Module._resolveFilename(request, parent, isMain, options) {
    var paths;
    if(options.paths) {
        // ...
    } else {
        paths = Module._resolveLookupPaths(request, parent, true)
    }
    var filename = Module._findPath(request, paths, isMain);
    return filename
}
```

## Module._resolveLookupPaths
用于获取有可选的路径，以解析文件"/Users/enhanced-resolve/index.js"为例：

参数`request`的几种常见情况：
* 为绝对路径时，其实返回什么都没关系，因为下一步执行`Module._findPath`时会忽略这里的返回值。
* 为`.`时，会把当前解析文件目录放在第一位置，后续解析先在当前文件夹下查找。
* 为相对路径时，仅返回解析文件所在目录。
* 为模块路径时，返回`parent.paths`，后续在这些模块文件夹里查找。

`parent.paths`里存了调用文件的目录及它所有上级目录下的node_modules时，将会有以下三个值：
- "/Users/enhanced-resolve/node_modules"
- "/Users/node_modules"
- "/node_modules"

```js
Module._resolveLookupPaths = function(request, parent) {
    // [ '/path/to/file', '.', 'diff' ]
    if (request.length < 2 || request[0] !== '.' ||
      (request[1] !== '.' && request[1] !== '/')) {
        paths = parent.paths
        if (request === '.' && parent.filename) {
            paths.unshift(path.dirname(parent.filename));
        }
        return paths
    }

    return [path.dirname(parent.filename)]
}
```

## Module._findPath
如果是绝对路径则分析该路径下是否可找到文件，如果是相对路径则分析是否在给定的文件夹下
```js
Module._findPath = function(request, paths) {
    if (path.isAbsolute(request)) {
        paths = [''];
    }
    for (var i = 0; i < paths.length; i++) {
        var basePath = path.resolve(paths[i], request);
        // .js .json .node
        var exts = Object.keys(Module._extensions);
        var filename;
        var rc = stat(basePath);
        if (rc === 'File') {
            filename = basePath
        }
        if (!filename) {
            filename = tryExtensions(basePath, exts);
        }
        if (!filename && rc === 'Directory') {
            filename = tryPackage(basePath, exts);
            if (!filename) {
                filename = tryExtensions(path.resolve(basePath, 'index'), exts);
            }
        }
        if(filename) return filename
    }
}
```

## Module.tryPackage
判断该路径是否是一个node package，如果是就根据描述文件的`main`字段来查找文件
```js
function tryPackage(requestPath, exts) {
    const jsonPath = path.resolve(requestPath, 'package.json');
    const json = internalModuleReadJSON(jsonPath);
    if (json === undefined) return false;
    const name = JSON.parse(json).main

    var filename = path.resolve(requestPath, name);
    return tryFile(filename) ||
        tryExtensions(filename, exts) ||
        tryExtensions(path.resolve(filename, 'index'), exts);
}

```

## Module.tryExtensions
判断加上扩展名后的路径是否是文件
```js
function tryExtensions(p, exts) {
  for (var i = 0; i < exts.length; i++) {
    const filename = tryFile(p + exts[i]);
    if (filename) return filename;
  }
  return false;
}
```

## Module.tryFile
判断路径是否是文件
```js
function tryFile(requestPath) {
  const rc = stat(requestPath);
  return rc === 0 && toRealPath(requestPath);
}
```

# 实战演练
从上面的代码来看，整体流程还是非常清晰的，现在再来分析最开始的几个疑惑：

## 绝对路径 resolve('/Users/enhanced-resolve/')
- 进入`_findPath`，因为是绝对路径，所以仅在该目录下查找；
- 进入`tryPackage`，获取到该目录下描述文件`package.json`，其中`main: ./lib/node.js`，使用该路径查找；
- 进入`tryFile`，解析出`/Users/enhanced-resolve/lib/node.js`；

## 相对路径 resolve('./index')
- 进入`_resolveLookupPaths`，因为是相对路径，只返回一个搜索目录`[/Users/enhanced-resolve]`；
- 进入`_findPath`，因为`/Users/enhanced-resolve/index`不是文件，所以尝试使用扩展名查找
- 进入`tryExtensions`，解析出`/Users/enhanced-resolve/index.js`;

## 模块路径 resolve('diff')
- 进入`_resolveLookupPaths`，返回多个搜索目录`["/Users/enhanced-resolve/node_modules", "/Users/node_modules", "/node_modules"]`;
- 进入`_findPath`，首先解析第一个可能的目录`/Users/enhanced-resolve/node_modules`;
- 进入`tryPackage`，获取到该目录下描述文件`package.json`，其中`main: ./diff`，使用该路径查找；
- 进入`tryFile`发现`/Users/enhanced-resolve/node_mdoules/diff/diff`不是文件，返回;
- 进入`tryExtensions`，解析出`/Users/enhanced-resolve/node_mdoules/diff/diff.js`;
