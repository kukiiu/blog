# Webpack中目录解析及优化
在Webpack中我们可以任意使用多种模块化方式组织代码：
- ES6: `import xxx from 'xxx'`
- CommonJS: `require('./xxx')`
- AMD...

我们可以使用它导入各种第三方库及项目文件，也可以使用别名来简化路径。我们知道，虽然CommonJS是node原生支持的依赖管理方法，但是我们打包项目时不是node来加载要打包的文件，而且查找规则也和node的不一样，所以Webpack实现了自己的一套文件查找方法。

依赖这套加载器，Webpack可以实现各种模块化规则解析，同时支持别名，目录查找等定制化的需求。下面我们来看看它的实现方式：

# 初始化及使用Resolver
Webpack中使用`enhanced-resolve`包装的`ResolverFactory`提供实例化方法，并根据参数添加特殊功能的插件，共创建了三种类型的resolver：
- normalResolver：提供文件路径解析功能，用于普通文件导入
- contextResolver：提供目录路径解析功能，用于动态文件导入
- loaderResolver：提供文件路径解析功能，用于loader文件导入

在创建模块时，就会利用Resolver预先判断路径是否存在，并获取路径的完整地址供后续加载文件使用。

## ResolverFactory
`ResolverFactory`继承了`Tapable`，共提供两类钩子，两个都是个是在创建`resolver`时调用：
```js
class ResolverFactory extends Tapable {
	constructor() {
		super();
		this.hooks = {
			resolveOptions: new HookMap(() => new SyncWaterfallHook(["resolveOptions"])),
			resolver: new HookMap(() => new SyncHook(["resolver", "resolveOptions"]))
		};
    }
    get(type, resolveOptions) {
        // 调用配置钩子
		resolveOptions = this.hooks.resolveOptions.for(type).call(resolveOptions);
		const resolver = Factory.createResolver(resolveOptions);
        // 调用新建钩子
		this.hooks.resolver.for(type).call(resolver, resolveOptions);
		return resolver;
    }
```

## 默认创建参数
在未修改配置情况下，Webpack给Resolver设定的默认值如下：
- `normalResolver`
```js
aliasFields: ["browser"]
cacheWithContext: false
extensions: [".wasm", ".mjs", ".js", ".json"]
fileSystem: CachedInputFileSystem 
mainFields: ["browser", "module", "main"]
mainFiles: ["index"]
modules: ["node_modules"]
unsafeCache:true
```
- `contextResolver`
```js
aliasFields: ["browser"]
cacheWithContext: false
extensions: [".wasm", ".mjs", ".js", ".json"]
fileSystem: CachedInputFileSystem 
mainFields: ["browser", "module", "main"]
mainFiles: ["index"]
modules: ["node_modules"]
unsafeCache:true
resolveToContext:true
```
- `loaderResolver`
```js
cacheWithContext: false
extensions: [".js", ".json"]
fileSystem: CachedInputFileSystem
mainFields: ["loader", "main"]
mainFiles: ["index"]
unsafeCache: true
```

## WebpackOptionsApply
在`WebpackOptionsApply`中初始化配置时，会在`hook.resolveOptions`上添加额外配置
```js
// normalResolver, loaderResolver
{ fileSystem: compiler.inputFileSystem }
// contextResolver
{ fileSystem: compiler.inputFileSystem, resolveToContext: true }
```

## NodeSourcePlugin
用于对Node.js核心库polyfill，当Webpack配置`target`是`web,webworker`时启用。例如`os`是node的核心模块，在浏览器里是没有的，但是用webpack打包后会加上polyfill，打包后能在浏览器中运行：
```js
const os = require('os')
console.log(os)
```
在初始化时，会向`hooks.resolver`添加`AliasPlugin`插件，将需要polyfill的库名添加到别名中。 

## AMDPlugin
用于处理`AMD`模块化相关代码，其中会向`hooks.resolver`添加`AliasPlugin`插件。在启用AMD模块化时，`define`作为`AMD`关键字不允许被间接使用，例如下面代码在打包过程中，`define`会转换为`webpack amd define`当成一个模块被引入，插件在遇到这个模块时会返回一个异常的函数：
```js
const df = define
console.log(df)
```
打包后生成的代码：
```js
"./buildin/amd-define.js": (function(module, exports) {
    module.exports = function() {
        throw new Error("define cannot be used indirect");
    };
}),
"./src/example.js": (function(module, exports, __webpack_require__) {
    const df = __webpack_require__("./buildin/amd-define.js")
    console.warn(__webpack_require__("./buildin/amd-define.js"))
})
```

## 调用位置
`NormalModuleFactory`用于创建普通模块对象，在`create`方法中会调用创建好的`normalResolver`检查将要创建的模块是否存在，另外会使用`contextResolver`检查使用的目录是否存在。

`ContextModuleFactory`用于创建普通模块对象，在`create`方法中会调用创建好的`normalResolver`检查将要创建的模块是否存在。

# 优化
> 如果对`enhanced-resolve`原理不了解，可以先看[这篇文章](https://juejin.im/post/5e392957f265da574d0ff946)

首先准备两个文件，并添加babel-loader：
```js
// example.js
const inc = require('./increment');

// increment.js
console.log('1+1');

// webpack.config.js
module.exports = {
    mode: 'development',
    entry: "./src/example.js",
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'] }
        }
      }]
    }
}
```
运行打包后，可以看到resolver相关的输出日志：
```js
// resolve './src/example.js' in '/Users/kukiiu/Desktop/study/webpack'
//   using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: .)
//     Field 'browser' doesn't contain a valid alias configuration
//     using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./src/example.js)
//       no extension
//         Field 'browser' doesn't contain a valid alias configuration
//         existing file: /Users/kukiiu/Desktop/study/webpack/src/example.js
//           reporting result /Users/kukiiu/Desktop/study/webpack/src/example.js
// resolve 'babel-loader' in '/Users/kukiiu/Desktop/study/webpack'
//   Parsed request is a module
//   using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: .)
//     resolve as module
//       /Users/kukiiu/Desktop/study/node_modules doesn't exist or is not a directory
//       /Users/kukiiu/Desktop/node_modules doesn't exist or is not a directory
//       /Users/node_modules doesn't exist or is not a directory
//       /node_modules doesn't exist or is not a directory
//       looking for modules in /Users/kukiiu/node_modules
//         using description file: /Users/kukiiu/package.json (relative path: ./node_modules)
//           using description file: /Users/kukiiu/package.json (relative path: ./node_modules/babel-loader)
//             no extension
//               /Users/kukiiu/node_modules/babel-loader doesn't exist
//       looking for modules in /Users/kukiiu/Desktop/study/webpack/node_modules
//         using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./node_modules)
//           using description file: /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/package.json (relative path: .)
//             no extension
//               /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader is not a file
//             .js
//               /Users/kukiiu/node_modules/babel-loader.js doesn't exist
//             .js
//               /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader.js doesn't exist
//             .json
//               /Users/kukiiu/node_modules/babel-loader.json doesn't exist
//             as directory
//               /Users/kukiiu/node_modules/babel-loader doesn't exist
//             .json
//               /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader.json doesn't exist
//             as directory
//               existing directory
//                 use ./lib/index.js from main in package.json
//                   using description file: /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/package.json (relative path: .)
//                     using description file: /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/package.json (relative path: ./lib/index.js)
//                       no extension
//                         existing file: /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/lib/index.js
//                           reporting result /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/lib/index.js
// resolve './increment' in '/Users/kukiiu/Desktop/study/webpack/src'
//   using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./src)
//     Field 'browser' doesn't contain a valid alias configuration
//     using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./src/increment)
//       no extension
//         Field 'browser' doesn't contain a valid alias configuration
//         /Users/kukiiu/Desktop/study/webpack/src/increment doesn't exist
//       .wasm
//         Field 'browser' doesn't contain a valid alias configuration
//         /Users/kukiiu/Desktop/study/webpack/src/increment.wasm doesn't exist
//       .mjs
//         Field 'browser' doesn't contain a valid alias configuration
//         /Users/kukiiu/Desktop/study/webpack/src/increment.mjs doesn't exist
//       .js
//         Field 'browser' doesn't contain a valid alias configuration
//         existing file: /Users/kukiiu/Desktop/study/webpack/src/increment.js
//           reporting result /Users/kukiiu/Desktop/study/webpack/src/increment.js
```
可以看到，resovler做了很多重复或没用的查询，主要分为3个文件的查询`example.js, babel-loader, ./increment`，下面我们看看常用的几个优化方法是怎么提升查找速度的

## 使用别名
因为有了缓存机制，别名可以在不同文件使引入路径不变，发挥缓存作用。但是单独使用时因为多了个别名查找，会多一层替换步骤反而慢一点。
```js
resolve: {
    alias: {
        ROOT: path.resolve('src/'),
    },
},
```

## 使用扩展名
引入文件时使用扩展名可以最快速度找到文件，不需要通过遍历扩展名来判段文件是否存在。

## 减少扩展名范围
`resolve.extensions`可以控制默认需要搜索的扩展，默认是`[".wasm", ".mjs", ".js", ".json"]`，可以根据项目情况来设置，最常用的放第一位，通常只设置`['.js']`就好。

## 减少描述文件查找范围
`resolve.modules`和`resolveLoader.modules`的默认值为`[node_modules]`，指在查找第三方模块目录或项目根目录，而模块是否找到是以目录下是否有描述文件为判定，如果在当前文件目录下查找不到，就往上一级查找。一般来说我们都会将`node_modules`放在项目根目录下，所以只要将其指定为绝对路径就能减少查找次数。
```js
resolve: {
    modules: [path.resolve("node_modules")],
},
resolveLoader: {
    modules: [path.resolve("node_modules")],
},
```

## 意义不大的优化
在使用第三方库时，将库名设置别名，可以省去Webpack查找的过程，因为缓存的存在使其意义不大：
```js
resolveLoader: {
    alias: {
    'babel-loader': path.resolve('node_modules/babel-loader/lib/index.js'),
    },
},
```

## 较为危险的优化
有些库为了同时输出web端代码和服务器代码，会在`package.json`描述哪个文件是用于web端，哪个用于服务端。通常来说，导出的文件一般以`main`字段来描述，但是如果`main`描述的文件被服务端文件占用，就会使用`browser`来描述。在使用下面优化时要考虑第三方库的兼容，否则打包出的代码有可能不能在web端运行。

`mainFields`是在查找第三方模块的入口文件使用，我们可以使用`[main]`来缩小搜索范围。

`aliasFields`配置是为了替换模块里的某些文件使用，默认配置了`[browser]`，我们可以配置为`[]`不进行查找
```js
resolve: {
    aliasFields: [],
    mainFields: ['main'],
}
```

## 优化结果
经过一顿操作后，再次打包，输出日志如下，明显少了很多步骤。掌握了原理我们就可以根据项目情况来选择优化方案。
```js
// resolve './src/example.js' in '/Users/kukiiu/Desktop/study/webpack'
//   using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: .)
//     using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./src/example.js)
//       no extension
//         existing file: /Users/kukiiu/Desktop/study/webpack/src/example.js
//           reporting result /Users/kukiiu/Desktop/study/webpack/src/example.js
// resolve 'babel-loader' in '/Users/kukiiu/Desktop/study/webpack'
//   Parsed request is a module
//   using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: .)
//     aliased with mapping 'babel-loader': '/Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/lib/index.js' to '/Users/kukiiu/Desktop/study/webpack/
// node_modules/babel-loader/lib/index.js'
//       using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: .)
//         using description file: /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/package.json (relative path: ./lib/index.js)
//           no extension
//             existing file: /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/lib/index.js
//               reporting result /Users/kukiiu/Desktop/study/webpack/node_modules/babel-loader/lib/index.js
// resolve './increment.js' in '/Users/kukiiu/Desktop/study/webpack/src'
//   using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./src)
//     using description file: /Users/kukiiu/Desktop/study/webpack/package.json (relative path: ./src/increment.js)
//       no extension
//         existing file: /Users/kukiiu/Desktop/study/webpack/src/increment.js
//           reporting result /Users/kukiiu/Desktop/study/webpack/src/increment.js
```


# 参考资料
[enhanced-resolve](https://juejin.im/post/5e392957f265da574d0ff946)

[node-libs-browser](https://github.com/webpack/node-libs-browser)
