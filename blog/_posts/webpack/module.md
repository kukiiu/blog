# 模块 Module
在Webpack中，一切资源都被看作`模块`，也就是说不管是`js`、`css`还是图片文件，Webpack都将他们都抽象成一个个模块，模块记录了资源的位置和内容，编译过程就是从入口模块开始递归找到所有需要用的模块，最终将所有模块打包输出。

模块说白了就是文件在Webpack中的表示对象，道理很简单，但不知大家心中有没有许多问号，资源是怎样转换成为模块？Webpack怎样识别不同的资源？怎样从收集到所有的模块？模块又是怎样输出结果？

前面的`入口Entry`章节我们已经知道，一个单入口配置经过一顿操作后会生成`NormalModule`来表示入口文件模块，从第一个起始模块开始，就可以将其他`require`或`import`导入的资源统统转成模块供后续输出流程使用。这节开始，我们就来揭晓Webpack中`模块`是怎样构建起来：

# 开局一个简单的js文件
js文件是我们打包的主要文件类型，所以当然先从一个js文件开始，我们这里选择打包一个没有`require`或`import`其他文件的js，因为如果有依赖其他文件分析起来太复杂，我们先从简单的js开始分析：
- 准备一个js文件：
```js
// .src/empty.js
console.log('hello webpack')
```
- 接着修改配置文件中的entry：
```js
// webpack.config.js
{ entry: './src/empty.js' }
```

## 配置解析
Webpack默认只能解析`js`、`json`及`wasm`类型的文件，所以会有专门处理这三种类型的解析器`Parser`，其他类型的文件需要通过loader转换成`js`来兼容。在配置解析过程中，会注册js模块处理插件`JavascriptModulesPlugin`，它的作用就是注册js解析器`Parser`及js输出模版生成器`JavascriptGenerator`：
> 解析js的Parser就叫`Parser`,解析json的Parser叫`JsonParser`
```js
// JavascriptModulesPlugin.js
(compilation, { normalModuleFactory }) => {
    // 对 javascript/auto 类型的文件使用 Parser 解析
	normalModuleFactory.hooks.createParser.for("javascript/auto")
		.tap("JavascriptModulesPlugin", options => {
			return new Parser(options, "auto");
        });
    // ...
}
```

## 创建模块
生成入口依赖的过程我们在前面的`入口Entry`章节有分析过，由于我们这里使用了单入口配置`./src/empty.js`，所以会生成单入口依赖`SingleEntryDependency`。这个地方比较有意思的是Webpack并没有直接生成一个模块，而是先生成了一个`依赖`，接着再使用`NormalModuleFactory`解析依赖，并生成模块`NormalModule`:
```js
// NormalModuleFactory.js
class NormalModuleFactory {
    create(context, dependencie) {
        // 资源路径，如果是入口依赖则这个就是入口文件路径
        const request = dependencie.request
        // 资源类型
        const type = this.getType(request)
        return new NormalModule({
            // 创建解析该模块需要的loader
            loaders: this.createLoaders(request)
            // 获取模块解析器
            parser: this.getParser(type)
            // 获取模版生成器
            generator: this.getGenerator(type)
        });
    }
}
```
这里有个比较重要的变量`type`，它用来标识这个模块用什么样的方式解析，上面说了Webpack默认只能解析`js`、`json`及`wasm`类型的文件，所以`type`也只有这三种，分别对应三种不同的`Parser`，默认值为`javascript/auto`即默认使用处理js的`Parser`。Webpack内部添加了默认规则，这个规则会和外部配置的`rules`合并。
```js
// WebpackOptionsDefaulter.js
class WebpackOptionsDefaulter {
	constructor() {
		this.set("module.defaultRules", "make", options => [
            // 默认文件使用类型javascript/auto"
            { type: "javascript/auto", resolve: {} },
            // 如果遇到.json文件，用json类型
			{ test: /\.json$/i, type: "json" },
		]);
    }
}
```
那难道解析图片文件也用`javascript/auto`类型解析器吗？没错，待会下面我们会说到。这里解析器`Parser`和`loader`可不是同一个东西，大家需要区分开，解析器是用来分析文件依赖，如分析`require`等；loader是用来做内容转换，如`es6`转`es5`等。经过这一步后，入口文件就转换成一个模块了。

## 构建模块
模块创建完后，此时只是获取了模块的基本信息，如相对路径，文件类型，需要用哪些loader处理这个文件等。接下来就要调用模块的构建函数，用于真正加载并处理文件。
```js
// Compilation.js
buildModule(module) {
    module.build()
}
```
首先会使用loader加载文件并转换内容，这里会通过使用不同loader来转换资源文件，js文件内容可以直接传给下一步，非js文件经过loader后一般会输出一段js字符串内容，后面会举例演示。本例经过loader处理后得到的结果内容就是原文件内容`console.log('hello webpack')`。

接着使用parser解析上面的结果，解析js的parser做的事情主要是将内容转换成`ast`，并解析出文件所有的依赖，由于我们解析的js非常简单，在构建时并不会有什么依赖输出，所以我们先暂且忽略这里。
```js
// NormalLoader.js
class NormalLoader {
    build() {
        // 执行loader
        const result = runLoaders(this.resource, this.loaders)
        this.source = result
        // 解析输出内容
        this.parser.parse(this.source)
    }
}
```

## 模块依赖处理
经过模块构建阶段后，`NormalModule`就已经获取到完整的内容，并且获取到了它的所有依赖。接下来就是要处理这些依赖。在这里会过滤掉不需要递归解析的依赖，由于Webpack中依赖的代表的内容比较多，通常来说只有使用`require`或`import`的`模块依赖`才会需要被递归解析，即递归生成相应的资源模块，其他依赖不需要生成新的模块就不会在这里处理。由于本例子没有生成依赖，所以这里也不会执行：
```js
// Compilation.js
// 用于获取需要被递归解析的依赖
processModuleDependencies(module) {
    const dependencies = []
	module.dependencies.map(dep => {
        // 有resourceIdent的才是模块依赖，需要生成新的模块
        const resourceIdent = dep.getResourceIdentifier();
        if (resourceIdent) {
            dependencies.push(dep);
        }
    })
    this.addModuleDependencies(module, dependencies);
}
// 递归解析模块依赖
addModuleDependencies(module, dependencies) {
    dependencies.map(dep => {
        // 创建模块 -> 构建模块 ...
        const factory = dep.factory
        const dependentModule = factory.create()
        this.buildModule(dependentModule)
    })
}
```

## 输出文件
在所有模块解析完成后，模块构建阶段`make`就完成了，接下来进入`seal`阶段，即把所有模块构建出输出内容，主要负责生成输出内容的函数是`Compilation.createChunkAssets`，但是不是这里的重点，我们在输出文件章节中再详细分析。最终我们会看到Webpack给我们生成了下面的js：
```js
(function(modules){
    // 启动函数...
})({  "./src/empty.js":
    /*!******************************!*\
    !*** (webpack)/src/empty.js ***!
    \******************************/
    /*! no static exports found */
    (function(module, exports) {
        console.log('hello webpack')
    })
})
```



# 打包一个json文件
Webpack除了解析`js`文件外，同时内置支持解析`json`文件，我们同样可以解析一个`json`看看它的工作流程。

## 准备工作
- 我们准备一个简单的json文件，将用Webpack来打包这个json文件：
```json
// a.json
{
    "say hello": "webpack",
    "foo": ["bar"]
}
```
- 接着修改配置文件中的entry：
```js
// webpack.config.js
entry: './src/a.json'
```

## 流程分析
- `JsonModulesPlugin`注册json解析器`JsonParser`及json输出模版生成器`JsonGenerator`，webpack能直接解析json文件就是这个解析器的功劳：
```js
// JsonModulesPlugin.js
(compilation, { normalModuleFactory }) => {
	normalModuleFactory.hooks.createParser.for("json")
		.tap("JsonModulesPlugin", () => new JsonParser() });
	normalModuleFactory.hooks.createGenerator.for("json")
		.tap("JsonModulesPlugin", () => new JsonGenerator() });
}
```
- 创建单入口依赖`SingleEntryDependency`，通过`NormalModuleFactory`解析后，生成`NormalModule`，这一步跟解析js文件一样。
- 构建模块`module.build`，通过loader获取到json文件内容。
- 由于类型是json，所以使用`JsonParser`解析内容，将json文件转为对象，给`module`添加依赖`JsonExportsDependency`依赖，用于在输出文件时标记导出内容，作用不大可以先忽略。
```js
class JsonParser {
	parse(source, state) {
        // 解析json为对象
		const data = parseJson(source);
		state.module.buildInfo.jsonData = data;
        state.module.buildMeta.exportsType = "named";
        // 给json添加依赖，但是这个不是模块依赖，只是给输出做个标记，注释掉也没问题
		if (typeof data === "object" && data) {
			state.module.addDependency(new JsonExportsDependency(Object.keys(data)));
		}
		state.module.addDependency(new JsonExportsDependency(["default"]));
		return state;
	}
}
```
- 处理模块依赖`processModuleDependencies`，由于`JsonExportsDependency`继承于`NullDependency`，不属于模块依赖，所以这里不需要继续处理。
- 渲染输出内容，其中会调用`JsonGenerator`生成json输出数据。

## 输出
执行Webpack过后，我们可以看到输出了下面的js文件：
```js
(function(modules){
    // 启动函数...
})({
    "./src/a.json": 
    /*!****************************!*\
    !*** (webpack)/src/a.json ***!
    \****************************/
    /*! exports provided: say hello, foo, default */
    (function(module) {
        module.exports = JSON.parse("{\"say hello\":\"webpack\",\"foo\":[\"bar\"]}");
    })
})
```

可以看到Webpack对`json`的解析和对`js`的解析过程大同小异。由于解析`json`所用的`JsonParse`非常简单，可以说是js的简化版本，之所以这么简单是因为一般json只是作为描述内容，并不会依赖其他文件，而且我们代码中引用json文件也只是获取它的值，如果看js的`Parser`那就复杂多了。

# 打包一个图片文件
以上在解析`js`和`json`都是Webpack默认支持的，现在我们看看默认不支持的文件类型是怎么打包的。由于webpack默认不识别图片类型文件，所以我们要加个能处理图片的loader来处理。

## 准备工作
- 安装`file-loader`
- 准备一个图片`a.png`
- 修改配置文件中的entry和rules：
```js
// webpack.config.js
{
    entry: './src/a.png',
    module: {
        rules: [{
          test: /\.png$/,
          use: [{ loader: 'file-loader', options: { outputPath: '/', } }]
        }]
    }
}
```

## 流程分析
- 入口文件生成`NormalModule`过程和上面一样；
- 构建模块这一步和上面比较不同，原来的图片会在loader执行中通过`emitFile`将文件输出，而经过`loader`处理后返回的结果则是一段js字符串，由于是js字符串所以当然可以给解析js的`Parser`处理结果：
```js
export default __webpack_public_path__ + "/2abc8e354a818e3316cc7c9dc97f881e.png";
```
- 使用`Parser`解析上面的结果，由于这段js还比较复杂，经过处理后一共添加了下面几个依赖`HarmonyCompatibilityDependency`、`HarmonyInitDependency`、`HarmonyExportHeaderDependency`、`HarmonyExportExpressionDependency`、`ConstDependency`
但是好在这些都不是模块依赖，不需要递归进行处理，他们主要在输出内容时用到，我们可以暂时忽略；
- 渲染输出内容

## 输出
执行Webpack过后，会输出一张图片和下面的js文件：
```js
(function(modules){
    // 启动函数...
})({ "./src/a.png":
    /*!***************************!*\
    !*** (webpack)/src/a.png ***!
    \***************************/
    /*! exports provided: default */
    (function(module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        /* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.p + "/2abc8e354a818e3316cc7c9dc97f881e.png");
    })
})
```

# 总结
以上我们分析的三个文件都是非常简单的内容，基本流程就是以下几点：
- 解析配置
- 创建入口模块
- 解析入口模块
- 输出文件

当然Webpack对模块的处理肯定没那么简单，文章反复提到的`模块依赖`还没正式出场，解析js文件用的`Parser`也只是简单提起。这里我们只需要对解析模块流程有个大概印象，了解模块在Webpack充当的角色就行，后面我们将详细分析其中的具体内容。

# 参考资料
[入口entry](https://juejin.im/post/5e50c8c9518825492b50abee)

[loader及优化](https://juejin.im/post/5e40161a6fb9a07cce74d3db)
