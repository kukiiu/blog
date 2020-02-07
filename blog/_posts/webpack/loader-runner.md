# loader-runner
`loader-runner`在Webpack的构建模块周期使用，负责将文件路径转换为文件内容。我们添加的`loader`最终会在这里执行，另外资源文件也是在这里被加载。文章使用`2.4.0`版本代码调试。

# loader基础功能
整个`loader-runner`基本上是围绕以下功能实现，在进入源码前首先我们先了解它的功能场景：

## loader执行流程 normal 和 pitch
一个loader可以定义两类函数，一个默认导出的函数`normalLoader`，一个用于阻断常规流程的函数`pitchLoader`，定义方式如下：
```js
// a-loader.js
// normal loader:
function aLoader(resource) {
    // ...
    return resource
}
// pitch loader:
aLoader.pitch = function() {}
module.exports = aLoader
```
如果我们配置`use: [ 'a-loader', 'b-loader', 'c-loader' ]`，且三个loader都没有`pitchLoader`或`pitchLoader`无返回值，loader将会以以下流程执行：
```js
// |- a-loader `pitch` 没有或无返回值
//   |- b-loader `pitch` 没有或无返回值
//     |- c-loader `pitch` 没有或无返回值
//       |- load resource
//     |- c-loader normal execution
//   |- b-loader normal execution
// |- a-loader normal execution
```
如果在`b-loader`的`pitch`函数返回了某个值，流程将会变成下面这样：
```js
// |- a-loader `pitch`
//   |- b-loader `pitch` 有返回值
// |- a-loader normal execution
```

## 同步/异步
loader可以支持以同步或异步(callback, Promise)方式运行，调用`this.async()`获取回调，并在执行完毕后调用。
```js
module.exports = function(resource) {
    const callback = this.async()
    asyncFunc((err, res) => {
        callback(err, res)
    })
}
```

## loader.raw
我们可以通过这个参数指定loader接收一个`buffer`类型的资源或`string`类型的资源。

## 监听文件改变 addDependency
在Webpack启用`watch`监听时，如果loader添加文件依赖，那么文件改变时会重新触发loader。

# 核心源码解析

## runLoaders - 入口函数
首先会对传入参数解析并创建`loaderContext`，在执行loader过程中`this`指向就是这个上下文，这里定义了一些变量及函数供loader使用，例如在`loader-utils`中获取loader参数就是通过loaderContext取得。在解析完参数后，就开始进入第一个阶段`pitch`：
```js
function runLoaders(options, callback) {
    // 定义上下文
    var loaderContext = options.context || {};
    // 待解析的文件
    loaderContext.resourcePath = options.resource;
    // 待解析文件的目录
	loaderContext.context = dirname(options.resource);
    // 当前执行到第几个loader
    loaderContext.loaderIndex = 0;
    // 创建loader对象
    loaderContext.loaders = options.loaders

    // 执行Pitch阶段
	var processOptions = {
		resourceBuffer: null,
		readResource: fs.readFile.bind(fs),
	};
    iteratePitchingLoaders(processOptions, loaderContext, (err, res) => {
		callback(null, {
            // 最后经过loader输出的值，可能为buffer或string
            result: result,
            // 最原始的资源buffer
            resourceBuffer: processOptions.resourceBuffer,
            // 是否需要缓存结果
            cacheable: requestCacheable,
            // loader需要监听的文件
            fileDependencies: fileDependencies,
            // loader需要监听的文件夹
			contextDependencies: contextDependencies
		});
    })
}
```

## iteratePitchingLoaders - 执行pitchLoader
这里采用了递归的方法来处理loader链式操作，当`pitch`都执行完开始加载资源，当`pitch`有返回值直接跳过加载资源，往回执行`normalLoader`：
```js
function iteratePitchingLoaders(options, loaderContext, callback) {
    // 如果所有loader的pitch都执行完，就开始执行loader
	if(loaderContext.loaderIndex >= loaderContext.loaders.length)
        return processResource(options, loaderContext, callback);
    
	var loader = loaderContext.loaders[loaderContext.loaderIndex];

	// 奇葩的递归执行操作，循环递增条件放在这里
	if(loader.pitchExecuted) {
		loaderContext.loaderIndex++;
		return iteratePitchingLoaders(options, loaderContext, callback);
    }
    
    // 加载执行loader.pitch
	loadLoader(loader, function(err) {
		var fn = loader.pitch;
		loader.pitchExecuted = true;
		if(!fn) return iteratePitchingLoaders(options, loaderContext, callback);

        runSyncOrAsync(fn, loaderContext, 
        [loaderContext.remainingRequest, loaderContext.previousRequest, loader.data = {}], 
        function(err) {
				if(err) return callback(err);
                var args = Array.prototype.slice.call(arguments, 1);
                // pitch有返回值，直接跳过后面的loader，并把返回值给其他loader
				if(args.length > 0) {
					loaderContext.loaderIndex--;
					iterateNormalLoaders(options, loaderContext, args, callback);
				} else {
					iteratePitchingLoaders(options, loaderContext, callback);
				}
			}
		);
	});
}
```

## processResource - 加载资源文件
这里会加载待处理的资源文件，并将其加入到文件监听中，然后开始执行`normalLoadr`：
```js
function processResource(options, loaderContext, callback) {
	// 开始往回执行loader
	loaderContext.loaderIndex = loaderContext.loaders.length - 1;

    loaderContext.addDependency(loaderContext.resourcePath);
    options.readResource(loaderContext.resourcePath, function(err, buffer) {
        if(err) return callback(err);
        options.resourceBuffer = buffer;
        iterateNormalLoaders(options, loaderContext, [buffer], callback);
    });
}
```

## iterateNormalLoaders 执行normalLoader
这里递归执行`normalLoader`，在执行前会进行资源类型的转换：
```js
function iterateNormalLoaders(options, loaderContext, args, callback) {
    // 所有loader执行完毕
	if(loaderContext.loaderIndex < 0)
		return callback(null, args);

	var loader = loaderContext.loaders[loaderContext.loaderIndex];

	// 奇葩的递归执行操作，循环递增条件放在这里
	if(loader.normalExecuted) {
		loaderContext.loaderIndex--;
		return iterateNormalLoaders(options, loaderContext, args, callback);
	}

	var fn = loader.normal;
    loader.normalExecuted = true;
    // 如果loader需要buffer类型的资源数据，在这里进行转换
	if(!raw && Buffer.isBuffer(args[0]))
		args[0] = utf8BufferToString(args[0]);
	else if(raw && typeof args[0] === "string")
		args[0] = new Buffer(args[0], "utf-8");
    
    // 执行loader
	runSyncOrAsync(fn, loaderContext, args, function(err) {
		if(err) return callback(err);

		var args = Array.prototype.slice.call(arguments, 1);
		iterateNormalLoaders(options, loaderContext, args, callback);
	});
}
```

## loadLoader - 加载loader
loader的`pitch`和`raw`属性都在这里加载，使用node的`require`加载：
```js
function loadLoader(loader, callback) {
    var module = require(loader.path);
    loader.normal = module.default;
    loader.pitch = module.pitch;
    loader.raw = module.raw;
    callback();
}
```

## runSyncOrAsync - loader执行包装
loader之所以能以同步或异步方式运行，是在这里做了兼容处理：
```js
function runSyncOrAsync(fn, context, args, callback) {
	var isSync = true;
	var isDone = false;
    var reportedError = false;
    // 异步loader要调用这个函数，先标志为异步返回
	context.async = function async() {
		isSync = false;
		return innerCallback;
    };
    // 异步回调
	var innerCallback = context.callback = function() {
		isDone = true;
		isSync = false;
        callback.apply(null, arguments);
    };
    // 执行loader函数
    var result = fn.apply(context, args);
    if(isSync) {
        isDone = true;
        if(result === undefined)
            return callback();
        if(result && typeof result === "object" && typeof result.then === "function") {
            return result.then(function(r) {
                callback(null, r);
            }, callback);
        }
        return callback(null, result);
    }
}

```

# 参考资料
[loader-runner github](https://github.com/webpack/loader-runner)

[loader-api](https://www.webpackjs.com/api/loaders/)

[loader集合](https://www.webpackjs.com/loaders/)

[编写一个loader](https://www.webpackjs.com/contribute/writing-a-loader/)
