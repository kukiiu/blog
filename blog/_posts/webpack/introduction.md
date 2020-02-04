# Webpack学习概论
在使用过Webpack后，它强大的的灵活性给我留下了深刻印象，通过Plugin和Loader几乎可以随意扩展功能，所以决定探究Webpack的实现原理，学习作者的编程思想。

但是在学习源码过程中还是遇到了挺大困难，一是它的插件系统设计的错综复杂，刚开始看容易被绕晕，另外是它功能实现覆盖的场景广，有很多内置功能不太熟悉。因此在这记录下学习的过程，将Webpack实现的精华内容提取出来，供后续学习参考。

因为Webpack的代码量也不算少，而且比较绕，如果光看代码会比较枯燥。所以决定以自己实现一个简易Webpack为目标，分步探索实现细节，从构建运行到实现一个能打包代码的工具。为了简化逻辑，不会完全像Webpack一样实现，以下部分是差异较大的地方：
- 使用TS实现：因为方便看类型。
- 不使用Webpack的插件机制：即不会用Tapable实现Hooks，因为看得太麻烦。

[github地址](https://github.com/kukiiu/freepack)

以下是完成计划，希望能坚持 😄
- [x] Webpack学习概论
- [x] [调试Webpack源码](https://juejin.im/post/5e05ca2fe51d45583b439c09)
- [x] [文件查找(一) enhanced-resolve](https://juejin.im/post/5e392957f265da574d0ff946)

# 基础概念
首先我们需要了解一些基础的Webpack概念，Webpack的构建流程基本是围绕以下概念进行：
- context: 绝对路径目录，默认使用当前目录，加载文件以该目录为基础。
- Entry: Webpack分析文件的入口点，指定了入口文件后，Webpack会递归分析出这个文件下的所有依赖文件，供后续输出。
- Module: Webpack将所有文件都看成模块，包含了文件的所有信息。
- Plugin: Webpack的运行过程就是一个个插件相互调用处理的过程，插件会在编译阶段的各个生命周期中被调用。
- Loader: 在加载文件后，解析文件前，对文件内容作自定义处理，如对文件内容替换删除等操作。
- Chunk: 封装了Module，是模块依赖和输出模版代码的桥梁

# 打包流程分析
![](https://user-gold-cdn.xitu.io/2020/1/20/16fbea74c37b5ece?w=2160&h=1166&f=png&s=542048)
## 初始化流程 webpack.js
* `WebpackOptionsDefaulter`合并默认配置，在webpack里已经默认了部分配置，如context设置为当前目录等。
* 创建编译器`Compiler`
* 加载自定义插件
* `WebpackOptionsApply`将选项设置给compiler，并加载各种默认插件，如用于引导入口的`EntryOptionPlugin`插件，加载js文件解析的`JavascriptModulesPlugin`等
* 运行compiler

## 初始化编译器 Compiler.js
* 初始化模块工厂`NormalModuleFactory`和`ContextModuleFactory`，模块工厂主要用于在后续创建和初始化模块
* 创建编译工具`Compilation`，在这里会通过钩子调用各种插件来初始化编译工具，如为入口模块添加解析器，为js类型文件添加解析器，添加模版处理方法等
* 调用make钩子执行EntryPlugin，运行compilation.addEntry进入模块解析

## 模块解析流程 Compilation.js
* 调用ModuleFactory创建入口模块 / 创建依赖模块
    - 解析资源路径，加载原始文件
    - 加载需要的Loader
    - 加载模块解析器
* 调用buildModule解析模块，输出依赖列表
    - 运行Loader
    - Parser解析出AST
    - walkStatements解析出依赖
* 调用addModuleDependencies递归创建依赖模块

## 模块输出流程 Compilation.js
* 创建`ChunkGroup`和`Chunk`，根据模块依赖解析出ChunkGraph
* 优化ChunkGraph
* `Template`根据Chunk创建输出内容
* 输出文件

# 实现一个简易版Webpack
## 示例代码
本次我们实现的效果是将两个简单文件打包成一个js，并且可以在浏览器运行，采用Commonjs模块化，我们再实现一个简单的loader，将代码中的log转换为warn：
```js
// example/index.js
const inc = require('./increment')
const dec = require('./decrement')
console.log(inc(8))
console.log(dec(8))

// example/increment.js
exports.default = function(val) {
    return val + 1;
};

// example/decrement.js
exports.default = function(val) {
    return val - 1;
};

// example/loader.js
module.exports = function loader(source) {
    return source.replace(/console.log/g, 'console.warn')
}
```

## 环境搭建
代码使用typescript编写，所以先安装typescript相关依赖
```shell
# typescript
"typescript": "^3.7.4"
# 帮助识别node相关的类型定义
"@types/node": "^13.1.4",
# 快速编译运行ts项目
"ts-node": "^8.5.4",
```
在package.json添加运行脚本
```json
"start": "npx ts-node index.js",
```

## 入口文件
入口文件就是我们运行Webpack的地方，这里我们定义一些简单的配置，包括编译入口文件`entry`，输出文件`bundle.js`，还有自定义loader。引入我们的核心编译器`Compiler`，传入配置运行。
```js
// index.js
const path = require('path')
const Compiler = require('./lib/Compiler').default

const options = {
    entry: path.resolve(__dirname, './example/index.js'),
    output: path.resolve(__dirname, './dist/bundle.js'),
    loader: path.resolve(__dirname, './example/loader.js')
}

const compiler = new Compiler(options)
compiler.run()
```

## 核心编译器Compiler

### Compiler创建
编译器负责封装打包过程，输入是用户配置，输出是打包结果，对外提供一个`run`函数启动编译。  
入口模块是编译器解析的起点，从入口文件开始递归加载模块文件，这里我们没有递归解析只简单地解析了入口文件的依赖，收集到所有依赖后渲染出合并后的代码，最后写出到文件。
```ts
// lib/Compiler.ts
import * as fs from 'fs'
import * as path from 'path'
import Module from './Module'
export default class Compiler {
    options: any
    constructor(options: any) {
        this.options = options
    }
    run() {
        // 创建入口模块
        const name = path.basename(this.options.entry)
        const entryModule = this.createModule(name, this.options.entry)
        // 解析依赖模块
        const dependencies = this.parse(entryModule.source)
        this.addModuleDependencies(entryModule, dependencies)
        // 渲染出结果
        const source = this.renderTemplate(entryModule)
        // 写入文件
        this.write(source, this.options.output)
    }
    // ...
}
```

### 创建模块
Webpack中将一切资源都看成模块，所以我们要解析的一个个js文件也是用模块表示，首先先定义一个`Module`类来表示模块：
```ts
// lib/Module.ts
export default class Module {
    id: string // 模块唯一标志，这里我们用文件名表示
    source: string // 文件源码
    absPath: string // 文件绝对路径
    dependencies: Module[] // 文件所有依赖
}
```
有了模块类我们就可以封装创建模块功能了，除了初始化数据外，我们还在这里将文件读取出来，然后使用loader对源码进行处理。
```ts
// Compiler.createModule
createModule(id: string, absPath: string) {
    const module = new Module()
    module.id = id
    module.absPath = absPath
    module.source = fs.readFileSync(absPath).toString()
    module.dependencies = []

    const loader = require(this.options.loader)
    module.source = loader(module.source)

    return module
}
```

### 分析模块依赖
webpack的基本功能就是将模块化代码打包成浏览器可运行代码。由于浏览器不能直接识别模块化代码，就需要我们将多个文件按依赖顺序合并成一个文件，所以识别出模块依赖是我们要解决的第一个问题。  
我们使用CommonJS来组织代码，就要在代码中识别出`require`这样的关键字，所以这里我们简单地使用正则匹配，经过循环匹配后，就能取出包含`require('xxx')`中的依赖项了。  
用正则匹配还需要考虑注释换行等麻烦的校验。Webpack则是将代码解析成AST树来分析依赖，AST里包含了更丰富的信息且不容易出错。
```ts
// Compiler.parse
parse(source: string) {
    const dependencies: any[] = []
    let result = []
    let reg = /require[('"].([^']*)[)'"]./g
    while((result = reg.exec(source))) {
        dependencies.push({
            id: result[1]
        })
    }
    return dependencies
}
```

### 创建依赖模块
在这里我们已经获取到了父模块和他的所有依赖项，此时我们就要将依赖也转成一个个模块，因为一个依赖也是一个文件，一个文件在webpack中就是一个模块。
```ts
// Compiler.addModuleDependencies
addModuleDependencies(module: Module, dependencies: any[]) {
    const dir = path.dirname(module.absPath)
    for (const dependent of dependencies) {
        const depModule = this.createModule(dependent.id, path.resolve(dir, dependent.id) + '.js')
        module.dependencies.push(depModule)
    }
    return
}
```

### 渲染模版
上面说了，要想将模块化代码转换成在浏览器环境下执行的代码，我们应该将所有将要执行的代码合并在一起，用一个js文件给浏览器执行，而且浏览器不识别的CommonJS语法也需要我们给打上补丁，让浏览器能正确识别`require`和`exports`，所以我们的目标代码应该长这样：
```js
(function (modules) {
    function require(moduleId) {
        var module = {
            id: moduleId,
            exports: {}
        }
        modules[moduleId](module, require)
        return module.exports;
    }
    require("index.js");
})({
    'index.js': (function (module, require) {
        const inc = require('./increment')
        const dec = require('./decrement')
        console.warn(inc(8))
        console.warn(dec(8))
    }),
    './increment': (function (module, require) {
        module.exports = function (val) {
            return val + 1;
        };
    }),
    './decrement': (function (module, require) {
        module.exports = function (val) {
            return val - 1;
        };
    }),
})
```
立即执行函数传入合并后的所有代码，并创建了`require`函数来加载合并后的对象，在我们的代码中遇到了`require`就会带入相应的函数，只要初始化后调用一次入口模块代码就能执行了。可以看到除了传参的代码，其他都是固定的模版代码，参数代码我们可以用前面解析的依赖来创建。
```ts
// Compiler.renderTemplate
renderTemplate(module: Module) {
    const buffer = []
    buffer.push(`(function(modules) {
        function require(moduleId) {
            var module = {
                id: moduleId,
                exports: {}
            }
            modules[moduleId](module, require)
            return module.exports;
        }
        require("${module.id}");
    })({`)

    buffer.push(`'${module.id}': (function(module, require) { \n ${module.source} \n }),`)
    for (const dependent of module.dependencies) {
        const src = `(function(module, require) { \n ${dependent.source.replace('exports.default', 'module.exports')} \n })`
        buffer.push(`'${dependent.id}':${src},`)
    }

    buffer.push(`})`)
    return buffer.reduce((pre, cur) => pre + cur, '')
}
```

### 输出文件
输出了模版代码后，只要调用系统方法将其输出到硬盘就可以了，非常简单
```ts
// Compiler.write
write(source: string, output: string) {
    fs.writeFileSync(output, source)
}
```
