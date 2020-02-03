# 路径解析
Webpack封装了一套解析库`enhanced-resolve`专门用于解析路径，例如我们写了`require('./index')`，Webpack在打包时就会用它来解析出`./index`的完整路径。

我们可以看到他的官方介绍：
> Offers an async require.resolve function. It's highly configurable. Features:  
    - plug in system  
    - provide a custom filesystem  
    - sync and async node.js filesystems included

可以看到官方定义他是一个`可配置化的异步require.resolve`。如果不了解`reqire.resolve`的同学可以先看看[require.resolve是什么](https://juejin.im/post/5e370570e51d451c7e04ab60)

# reqire.resolve的不足


# 路径解析规则
## 绝对路径
```js
import "/path/to/file";
```
### 相对路径
```js
import "../path/to/file";
```
### 模块路径
```js
import "module";
import "module/lib/file";
```

# 模块化方式

# Webpack实现方式

# 优化

# resolver原理

首先找到lib中的node.js文件,这里导出的函数是可以直接使用在node环境下.
```js
const res = resolve.sync(__dirname, "./lib/node")
```
执行后,会调用核心方法Resolver.resolve,有5个入参:
- context: 执行环境,是个对象
- path: 根路径
- request: 请求地址
- resolveContext: 上下文环境
- callback: 获取结果回掉

- 执行parsed-resolve钩子
    ### DescriptionFilePlugin
    - 解析package.json描述文件
    - DescriptionFileUtils用来解析获取描述文件
    - forEachBail保存异步forEach？？
    - ==》Hook:described-resolve
    ### NextPlugin
    - ？？？
- 执行described-resolve钩子
    ### ModuleKindPlugin
    - 这个插件要在ParsePlugin解析为module才执行
    - ==》Hook:raw-module
    ### JoinRequestPlugin
    - 在这里将相对路径转换为绝对路径查找文件
    - ==》Hook:relative
- Hook:relative
    ### DescriptionFilePlugin
    - 解析主文件的描述文件，由于./lib/node下没有描述文件，找到最上层的描述文件
    - ==》Hook:described-relative
    ### NextPlugin
    - ？？？
- Hook:described-relative
    ### FileKindPlugin
    - ==》Hook:raw-file
- Hook:raw-file
    ### TryNextPlugin
    - ==> Hook:file
    ### AppendPlugin
    - 这里会使用options.extensions || [".js", ".json", ".node"] 来解析文件
    - ==> Hook:file
- Hook:file
    ### SymlinkPlugin
    - ==》Hook:relative
    ### FileExistsPlugin
    - 如果文件存在
    - ==》Hook: existing-file
- Hook: existing-file
    ### NextPlugin
    ==> Hook: resolved
- Hook: resolved
    ### ResultPlugin 

## Resolver
- TODO 参数context不知道干嘛

## NodeJsInputFileSystem
该文件封装了文件操作方法,具体有:
- readdir/readdirSync: 异步/同步获取文件夹下所有文件和文件夹
- stat/statSync: 异步/同步获取文件/文件夹基础信息
- readFile/readFileSync: 异步/同步读取文件信息
- readlink/readlinkSync: 异步/同步获取文件/文件夹软连的真实链接

## CachedInputFileSystem
该文件封装了文件操作方法,为各个操作添加了缓存,另封装了获取json文件操作。这里会生成一组和操作函数相关的缓存对象，处理文件读取缓存及定时清除缓存。

##  UnsafeCachePlugin 将解析结果缓存下来
- @options unsafeCache  决定是否启用缓存
- @options cachePredicate 判断是否需要缓存
- @options cacheWithContext TODO 不知道context是干嘛的

## ParsePlugin 解析request路径
- 解析的时候会调用resolver.parse
- TODO query有什么用
- TODO isModule isDirectory有什么用

## DescriptionFilePlugin 解析描述文件
- 更新relativePath

## JoinRequestPlugin 将path 和request组合

## ModulesInHierachicDirectoriesPlugin


# 题材
- resolver的作用： 输入 =》 输出
- 3种resolver normal,loader,context
- 动态加载 与 resolver的关系 // 多种模块导入方式 及 动态加载  ES6 CommonJS AMD
- 优化
- 自己实现
- SystemJS ??