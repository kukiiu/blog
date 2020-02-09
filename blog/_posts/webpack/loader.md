# Loader
loader解析文件是Webpack中重要的一环，之所以能一切皆模块就是因为有许多强大的loader提供的支持。了解它的工作原理可以让我们从容地为项目选择合适的配置，还可以更有目的性的针对性能瓶颈分析优化，更好地做一个合格地Webpack配置工程师。

如果要了解loader内部执行原理，可以看这篇文章[loader-runner](https://juejin.im/post/5e3d8ac9518825495853b35c)

# loader基础
loader的配置非常灵活，以至于关于loader的代码有一大半是在解析参数，所以要看懂代码就要先清楚常用的配置，如果在翻阅代码时看着比较奇怪，可以先回来看看这段代码到底是处理哪一类配置，下面列举了一些常用的选项：

## loader执行顺序
在执行loader前，Webpack已经将其根据配置排好序，指定顺序会在创建loader阶段执行：
- 正常情况loader执行顺序: pre -> normal -> inline -> post
- 资源路径前使用'xxx!=!'装饰: pre -> inline -> normal -> post
- 资源路径前使用'-!'装饰: inline -> post
- 资源路径前使用'!'装饰: pre -> inline -> post
- 资源路径前使用'!!'装饰: inline

### 全局配置
```js
rules: [
    // 前置
    { enforce: 'pre', test: /\.js$/, use: 'babel-loader' },
    // 正则匹配
    { test: /\.js$/, use: 'babel-loader' },
    // 后置
    { enforce: 'post', test: /\.js$/, use: 'babel-loader' },
]
```

### inline配置
```js
// 普通
require('babel-loader!./increment.js')
// 多个loader，从右到左执行
require('style-loader!css-loader!less-loader!./increment.less')
// 带重命名!=!，交换normalLoader和inlineLoader执行顺序
require('aa.js!=!babel-loader!./increment.js')
// 带!!前缀只执行inline-loader
require('!!babel-loader!./increment.js')
```

## loader匹配条件
每个模块都会筛选出它需要的loader和相应的配置：

### inline匹配
```js
// 普通
require('babel-loader!./increment.js')
// 带参数
require('./myLoader?a=11&b=22!./increment.js')
/** 
 * 指定使用全局options配置
 * {
 *    test: () => false,
 *    use: { loader: 'babel-loader', ident: 'babelLoaderOptions', options: { presets: ['@babel/preset-env'] } }
 * }
 */
require('babel-loader??babelLoaderOptions!./increment.js')
```

### 全局condition条件
条件`condition`可以是这些之一，用于匹配资源绝对路径：
```js
rules: [
    // 字符串匹配，前缀匹配
    { test: path.resolve('./src/index.js'), use: 'babel-loader' },
    // 正则匹配
    { test: /\.js$/, use: 'babel-loader' },
    // 函数匹配，返回true表示匹配成功
    { test: (resourcePath) => { return true }, use: 'babel-loader' },
    // 数组匹配，只要一个匹配条件算匹配成功
    { test: [/\.js$/, /\.ts$/], use: 'babel-loader' },
    // 对象匹配，匹配上所有条件算匹配成功
    { test: { or: [/\.js$/, /.ts$/], exclude: /node_modules/ }, use: 'babel-loader' },
]
```

### resourceQuery
用于匹配路径参数，路径参数是引用资源时后面问号的内容，如`require('./a.js?matchMe`)将能匹配下面的loader:
```js
{
  test: /.js$/,
  resourceQuery: /matchMe$/,
  use: 'babel-loader'
}
```

### oneOf
使用第一个成功匹配的规则：
```js
{
  test: /.css$/,
  oneOf: [
    // 匹配require('foo.css?inline')
    { resourceQuery: /inline/,  use: 'url-loader' },
    // 匹配require('foo.css?external')
    { resourceQuery: /external/, use: 'file-loader' }
  ]
}
```

### 其他
- issure: 匹配引用这个资源的模块路径，如`foo.js`，`bar.js`同时引用了`inc.js`，可以指定只有`foo.js`才使用该loader。
- compiler: 匹配编译器名，一般没啥用。

## use配置
`use`用于指定匹配成功后需要用到哪些loader解析：
```js
// 字符串指定
use: 'babel-loader'
// 数组指定: 右到左执行
use: ['style-loader', 'css-loader']
// 对象指定，带参数
use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } }
// 数组混合
use: ['style-loader', { loader: 'css-loader', options: { modules: true } }, 'postcss-loader' ]
```

# Loader处理流程
Webpack对`loader`的处理主要在模块构建期间，另外做了缓存和监听操作，主要有下面三个流程：
- `RuleSet`：初始化时解析loader相关配置；
- `NormalModuleFactory.create`：根据配置匹配当前模块用到的loader，并将初始化好的`loader`数组通过构造函数传入；
- `NormalModule`：构建模块时使用`loader-runner`解析loader，获取处理后的文件内容；
```js
class NormalModuleFactory extends Tapable {
	constructor(context, resolverFactory, options) {
        super();
        // 参数解析
		this.ruleSet = new RuleSet(options.defaultRules.concat(options.rules));
    }

	create(data, callback) {
        // 解析inline-loader/normal-loader
        resolver(data, (result) => {
            // ...使用解析好的loaders创建NormalModule
            createdModule = new NormalModule({
                loaders: result.loaders,
                resource: result.resource,
            });
            // 返回创建好的NormalModule
            callback(null, createdModule)
        })
    }
}

class NormalModule extends Module {
	constructor({ loaders, resource }) {
        this.loaders = loaders
        // 文件路径
        this.resource = resource
    }

    // 构建module
	doBuild(options, compilation, resolver, fs, callback) {
        // 上下文，loader里的this指向这个对象
		const loaderContext = this.createLoaderContext(resolver, options, compilation, fs);
        // 调用loader-runner解析loader
		runLoaders({
            resource: this.resource,
            loaders: this.loaders,
            context: loaderContext,
            readResource: fs.readFile.bind(fs)
        }, (err, result) => {
            if (result) {
                // 缓存
                this.buildInfo.cacheable = result.cacheable;
                // 文件监听依赖
                this.buildInfo.fileDependencies = new Set(result.fileDependencies);
                // 文件夹监听依赖
                this.buildInfo.contextDependencies = new Set(result.contextDependencies);
            }
            // 最原始的文件数据buffer
            const resourceBuffer = result.resourceBuffer;
            // loader转换后的文件内容
            const source = result.result[0];
            // 有传出sourceMap就在这里取
            const sourceMap = result.result.length >= 1 ? result.result[1] : null;
            // 其他的额外内容，如解析出的AST
            const extraInfo = result.result.length >= 2 ? result.result[2] : null;
            this._ast = extraInfo.webpackAST
            return callback();
        });
    }
}
```

## RuleSet配置解析
参数解析应该是这里面最繁琐的阶段，因为支持的配置多所以解析起来麻烦，基本上都是规范化配置，使最终得到统一格式，下面分别看看这里面的关键函数：

### normalizeRule
用于规范化单个规则，有一大半代码是在做兼容处理：
```js
normalizeRule(rule, refs, ident) {
    const newRule = {}
    // ...
    if (rule.test || rule.include || rule.exclude) {
        // 检测同级互斥关系：(rule.test || rule.include || rule.exclude) 和 resource 只能存在一项
        checkResourceSource("test + include + exclude");
        condition = {
            test: rule.test,
            include: rule.include,
            exclude: rule.exclude
        };
        newRule.resource = RuleSet.normalizeCondition(condition);
    }
    // 和(rule.test || rule.include || rule.exclude)做的事情一样，兼容写法
    if (rule.resource) {
        checkResourceSource("resource");
        newRule.resource = RuleSet.normalizeCondition(rule.resource);
    }

    if (rule.use) {
        // 检测同级互斥关系： use, loaders, loader, loader + options/query 配置只能存在一项
        checkUseSource("use");
        // 规范化use配置
        newRule.use = RuleSet.normalizeUse(rule.use, ident);
    }

    // 将有自定义id的规则记录下来，可用于替换inline-loader的options
    if (Array.isArray(newRule.use)) {
        for (const item of newRule.use) {
            if (item.ident) {
                refs[item.ident] = item.options;
            }
        }
    }
    return newRule;
}
```

### normalizeCondition
用于输出匹配条件，我们在规则上配置的`test, include, exclude, and, or not`将在这里转换成匹配函数，用于解析某个资源时匹配是否需要这个loader：
```js
normalizeCondition(condition) {
    // 字符条件串兼容
    if (typeof condition === "string") return str => str.indexOf(condition) === 0;
    // 函数条件串兼容
    if (typeof condition === "function") return condition;
    // 正则条件兼容
    if (condition instanceof RegExp) return condition.test.bind(condition);
    // 条件数组兼容
    if (Array.isArray(condition)) return orMatcher(condition.map(c => normalizeCondition(c)));
    // 对象条件兼容
    const matchers = [];
    Object.keys(condition).forEach(key => {
        const value = condition[key];
        switch (key) {
            case "or": case "include": case "test":
                if (value) matchers.push(normalizeCondition(value));
                break;
            case "and":
                if (value) matchers.push(andMatcher(value.map(c => normalizeCondition(c))));
                break;
            case "not": case "exclude":
                if (value) matchers.push(notMatcher(normalizeCondition(value)));
                break;
        }
    });
    return andMatcher(matchers);
}
notMatcher = matcher => str => !matcher(str);
orMatcher = items => str => {
    for (let i = 0; i < items.length; i++) {
        if (items[i](str)) return true;
    }
    return false;
};
andMatcher = items => str => {
    for (let i = 0; i < items.length; i++) {
        if (!items[i](str)) return false;
    }
    return true;
};
```

## inline-loader解析
行内loader指直接在路径名前添加loader的情况，如`require('!babel-loader!./increment.js')`：
```js
resolver(data, callback) {
    // ...
    // 将以!=!开头的资源名去除，得到带有inline-loader信息的资源路径
    // eg: 'haha!=!babel-loader!./increment.js' => 'babel-loader!./increment.js'
    requestWithoutMatchResource = handleMatchResourcde(data.request)

    // 分割出来所有的inline-loader
    let elements = requestWithoutMatchResource
        .replace(/^-?!+/, "")
        .replace(/!!+/g, "!")
        .split("!");
    let resource = elements.pop();
    // 分离inline-loader带的query参数
    // eg: babel-loader?a=1!./increment.js => [ { loader: 'babel-loader', options: 'a=1' } ]
    elements = elements.map(identToLoaderRequest);

    // 获取loader的路径
    this.resolveRequestArray(contextInfo, context, elements, loaderResolver, (err, loaders) => {
        // 如果指定了使用某个定义的options，替换为自定义选项
        // eg: babel-loader??myOptions./increment.js 将会使用配置中 rules.use.ident=myOptions 的选项
        for (const item of loaders) {
            if (typeof item.options === "string" && item.options[0] === "?") {
                const ident = item.options.substr(1);
                item.options = this.ruleSet.findOptionsByIdent(ident);
                item.ident = ident;
            }
        }
    })
    // ... 解析RuleSet里的loader
}
```

## 全局loader解析
```js
resolver(data, callback) {
    // ...
    // 忽略normalLoader和preLoader
    const noPreAutoLoaders = requestWithoutMatchResource.startsWith("-!");
    // 忽略normalLoader
    const noAutoLoaders = noPreAutoLoaders || requestWithoutMatchResource.startsWith("!");
    // 忽略normalLoader和preLoader和postLoader
    const noPrePostAutoLoaders = requestWithoutMatchResource.startsWith("!!");
    // RuleSet匹配loader
    const result = this.ruleSet.exec({
        resource: resource,
        realResource: resource.replace(/\?.*/, ""),
        resourceQuery,
        issuer: contextInfo.issuer,
        compiler: contextInfo.compiler
    });
    // 三种优先级loader在这里匹配
    const useLoadersPost = [];
    const useLoaders = [];
    const useLoadersPre = [];
    for (const r of result) {
        if (r.type === "use") {
            if (r.enforce === "post" && !noPrePostAutoLoaders) {
                useLoadersPost.push(r.value);
            } else if (r.enforce === "pre" && !noPreAutoLoaders && !noPrePostAutoLoaders) {
                useLoadersPre.push(r.value);
            } else if (!r.enforce && !noAutoLoaders && !noPrePostAutoLoaders) {
                useLoaders.push(r.value);
            }
        }
    }
    // 解析三种loader完整路径
    const postLoaders = this.resolveRequestArray(contextInfo, this.context, useLoadersPost, loaderResolver)
    const defaultLoaders = this.resolveRequestArray(contextInfo, this.context, useLoaders, loaderResolver)
    const preLoaders = this.resolveRequestArray(contextInfo, this.context, useLoadersPre, loaderResolver)
    if (matchResource === undefined) {
        // post -> inline -> normal -> pre
        loaders = postLoaders.concat(inlineLoaders, defaultLoaders, preLoaders);
    } else {
        // post -> normal -> inline -> pre
        loaders = postLoaders.concat(defaultLoaders, inlineLoaders, preLoaders);
    }
    callback(null, {
        loaders,
        resource,
    })
}
```

## RuleSet匹配loader
```js
_run(data, rule, result) {
    // 由于规则已经在解析配置时转换成了函数，所以这里使用函数调用方式判断是否需要该loader
    if (rule.resource && !rule.resource(data.resource)) return false;
    if (rule.realResource && !rule.realResource(data.realResource)) return false;
    if (data.issuer && rule.issuer && !rule.issuer(data.issuer)) return false;
    if (data.resourceQuery && rule.resourceQuery && !rule.resourceQuery(data.resourceQuery)) return false;
    if (data.compiler && rule.compiler && !rule.compiler(data.compiler)) return false;
    // use的值可以是对象，数组或函数就是在这里做的兼容
    // 如果资源匹配上，加到结果集里
    if (rule.use) {
        const process = use => {
            if (typeof use === "function") {
                process(use(data));
            } else if (Array.isArray(use)) {
                use.forEach(process);
            } else {
                result.push({ type: "use", value: use, enforce: rule.enforce });
            }
        };
        process(rule.use);
    }
    // 循环匹配
    if (rule.rules) {
        for (let i = 0; i < rule.rules.length; i++) {
            this._run(data, rule.rules[i], result);
        }
    }
    // 只要有一个rule匹配上就使用该loader
    if (rule.oneOf) {
        for (let i = 0; i < rule.oneOf.length; i++) {
            if (this._run(data, rule.oneOf[i], result)) break;
        }
    }
    return true;
}
```

## resolveRequestArray
`NormalModuleFactory.resolveRequestArray`主要处理以下功能：
- 获取loader的完整路径地址
- 兼容处理不规范的配置写法
```js
resolveRequestArray(contextInfo, context, array, resolver, callback) {
    // 循环所有loader配置
    asyncLib.map(array, (item, callback) => {
        // 解析loader完整路径地址
        resolver.resolve(contextInfo, context, item.loader, {}, (err, result) => {
            // 如果没找到loader是因为省略了-loader，抛出异常提示
            if (err && /^[^/]*$/.test(item.loader) && !/-loader$/.test(item.loader)) {
                return resolver.resolve(contextInfo, context, item.loader + "-loader", {}, err2 => {
                    if (!err2) {
                        err.message = err.message + "loader不支持省略 '-loader' 后缀 \n" +
                            `You need to specify '${item.loader}-loader' instead of '${item.loader}',\n`
                    }
                    callback(err);
                });
            }
            if (err) return callback(err);
            // 格式化并输出结果
            const optionsOnly = item.options ? { options: item.options } : undefined;
            callback(null, Object.assign({}, item, identToLoaderRequest(result), optionsOnly))
        });
    }, callback)
}
```

## 输出结果

### result[source, sourceMap, extraInfo]
- source: 是经过loader处理后的内容；
- sourceMap: 如果有sourceMap，可以在这里获取；
- extraInfo: 这里放额外的输出内容，比如AST等；

### resourceBuffer
这是最原始文件的资源，没有经过loader

### fileDependencies / contextDependencies
如果文件需要`foo-loader`处理，那么`foo-loader`会默认将该文件添加到自己的依赖上，开启文件监听后如果文件改变，那么会重新执行`foo-loader`。

默认情况下loader只会添加匹配到的文件作为依赖，如果在loader执行过程中，需要用到其他文件如`data.txt`，且更新后要重新输出结果，那么可以使用`this.addDependency`来将其添加为依赖项，这样`data.txt`更新后会重新执行loader输出。

### cacheable
如果一个loader的输入和相关依赖没变化时输出结果不变，那么这个loader应该设置为可以缓存，在解析完所有loader后，会将结果缓存下来。

在监听文件情况下如果输出结果没变，文件不会重新输出。

默认情况下loader会开启缓存，在loader中可以使用`this.cacheable(false)`关闭缓存。

# 优化
loader是打包耗时的大块头，比如`babel-loader`在执行时能明显感觉到非常慢，所以了解了loader的基本原理，我们就可以针对性的对我们的项目做些优化：

## 缩小loader作用范围
最主要的优化还是在排除掉不必要的解析，用好`exclude`等选项基本上能满足大多数场景。

## loader缓存
有些loader本身提供了缓存的功能，比如`babel-loader`的`cacheDirectory`等，使用loader时需要我们熟悉它们的配置。

## 预编译
`DllPlugin`用于将代码预先打包抽离出来，使用时Webpack将不会重新编译直接引用。对于我们项目中的代码，不能用排除方法去除loader时，可以考虑先将比较稳定的代码预先编译一次，下次使用就可以不需要经过loader直接使用啦。

## 多进程编译
`thread-loader`或`HappyPack`可以让Webpack使用多个进程同时对文件执行loader。我们知道node是单线程模型，用一个线程处理当然很慢，如果能发挥多核CPU并行优势同时编译的话，编译速度能快不少。使用时要注意它们和loader的兼容性。

# 参考资料
[loader-runner](https://juejin.im/post/5e3d8ac9518825495853b35c)

[webpack rule 文档](https://www.webpackjs.com/configuration/module/)

[issure的解析](http://hk.voidcc.com/question/p-bhkkstmr-uh.html)

[DllPlugin](https://www.webpackjs.com/plugins/dll-plugin/)

[thread-loader](https://www.webpackjs.com/loaders/thread-loader/)

[HappyPack](https://github.com/amireh/happypack)
