# 入口Entry
Webpack的执行流程思想非常简单，从入口文件开始，递归地查找文件的依赖，最终将所有依赖输出到一个文件中。在这过程中又穿插了文件解析、输出优化等复杂的操作，我们就从最简单的入口开始，逐渐剥茧抽丝，拨开webpack的神秘面纱。

# 从配置说起
配置是衡量一个系统灵活性的主要标识，我们在使用某个系统前都会先去查看提供的配置项，可以快速告诉我们这个系统可以用什么样的方式运行。在深入理解源码前，我们有必要先熟悉它提供的配置，一是可以提前预习并大概想象它的实现思路，二是可以在研究源码时更好地追踪代码的起源。

由于Webpack提供了强大的灵活性，它的配置也非常复杂，许多人刚开始就挂在了它的配置上，好在入口的配置还不算复杂，主要有以下两部分：

## context
`context`的中文意思是`上下文`，上下文在不同的环境下有不同含义，在webpack中的配置项中有一项`context`，它的意思是解析入口文件时的基准目录，会从该目录下查找入口文件，默认为执行编译命令时的绝对路径。

通常情况下我们不需要设置，但是如果我们在其他目录执行webpack就会找不到路径，所以我们最好给他设置一个默认值：
```js
context: path.resolve(__dirname, "src")
```

## entry
`entry`就是我们配置入口的地方了，支持多种配置类型，通常我们只需要用到`string`类型参数。如果使用`object`配置，则会输出多份以它们的key为名称的文件。另外还能使用动态配置，入口可以支持异步获取：
```js
// string
entry: "./src/entry"
// array
entry: ["./src/entry1", "./src/entry2"]
// object
entry: {
    a: "./src/entry-a",
    b: ["./src/entry-b1", "./src/entry-b2"]
}
// 动态
entry: () => './demo'
// 动态
entry: () => new Promise((resolve) => resolve(['./demo', './demo2']))
```

# 流程梳理
由于Wepack的插件机制，导致了实现方式略显复杂，入口流程基本围绕以下几点进行：
1. 配置解析: 注册执行入口配置解析插件`EntryOptionPlugin`，
2. 入口配置处理: `SingleEntryPlugin`、`MultiEntryPlugin`、`DynamicEntryPlugin`
3. 注册入口依赖解析器: `NormalModuleFactory`解析单入口依赖，`MultiModuleFactory`解析多入口依赖
4. 创建入口依赖: 生成`SingleEntryDependency`、`MultiEntryDependency`
5. 解析入口依赖: 生成`NormalModule`及`MultiModule`

## 配置解析
Webpack启动后会先预处理配置文件，预处理后便会交由`WebpackOptionsApply`来根据配置注册各种插件，其中就会涉及到入口配置的处理插件`EntryOptionPlugin`。`EntryOptionPlugin`顾名思义就是`处理入口配置的插件`，在这里将处理`entry`的几种不同配置方法：
```js
// EntryOptionPlugin.js
function apply(context, entry) {
    if (typeof entry === "string") {
        // 默认输出文件名为 main
	    new SingleEntryPlugin(context, entry, 'main')
    } else if(Array.isArray(entry)) {
        new MultiEntryPlugin(context, entry, 'main')
    } else if (typeof entry === "object") {
        for (const name of Object.keys(entry)) {
            if (typeof entry[name] === "string") {
                // 默认输出文件名为 key
                new SingleEntryPlugin(context, entry[name], name)
            } else if(Array.isArray(entry[name])) {
                new MultiEntryPlugin(context, entry[name], name)
            }
        }
    } else if (typeof entry === "function") {
        new DynamicEntryPlugin(context, entry)
    }
})
```
可以看到代码还是很简洁，得益于Webpack的插件机制，这里非常方便地将不同类型的配置分配给不同的插件来处理。当然虽然代码会稍显啰嗦，但是带来的优点非常明显，职责分工明确，而且灵活性和扩展性都非常好。

## 入口配置处理 - 单入口配置
`SingleEntryPlugin`用于处理`string`类型的配置，如`entry: "./src/entry"`及`entry: { a: "./src/entry" }`。在这里一共做了两件事，一是注册单入口依赖处理器，二是创建单入口依赖并执行解析。

依赖是Webpack里一个重要概念，用于描述模块间的关系，每个依赖都有对应的处理器对其解析。这里我们只要知道单入口依赖`SingleEntryDependency`是由`NormalModuleFactory`进行解析，且他们之间的关系是在这里进行描述：
```js
// SingleEntryPlugin.js
// 在compiler.hooks.compilation阶段注册，这个钩子会在创建Compilation后调用
compiler.hooks.compilation.tap(
    (compilation, { normalModuleFactory }) => {
        // dependencyFactories维护了依赖与解析依赖方法的关系
        compilation.dependencyFactories.set(
            SingleEntryDependency,
            normalModuleFactory
        );
    }
);
```

接着注册了创建依赖的方法，这里将是真正将入口文件转换称为依赖对象，接着将其添加到`compilation`中正式开始解析，从这里开始就是入口和编译器的枢纽：
```js
// SingleEntryPlugin.js
// compiler.hooks.make 钩子在开始执行编译时调用
compiler.hooks.make.tapAsync(
    (compilation, callback) => {
        const { entry, name, context } = this;
        const dep = new SingleEntryDependency(entry);
        dep.loc = { name };
        compilation.addEntry(context, dep, name, callback);
    }
);
```

## 入口配置处理 - 多入口配置
多入口的流程和单入口差不多，不同的是这里要注册多入口和单入口两种处理器，可以从创建依赖对象中看到，一个多入口依赖里包含了多个单入口依赖：
```js
// MultiEntryPlugin.js
compiler.hooks.compilation.tap(
    (compilation, { normalModuleFactory }) => {
        const multiModuleFactory = new MultiModuleFactory();
        compilation.dependencyFactories.set(
            MultiEntryDependency,
            multiModuleFactory
        );
        compilation.dependencyFactories.set(
            SingleEntryDependency,
            normalModuleFactory
        );
    }
);
compiler.hooks.make.tapAsync(
    (compilation, callback) => {
        const { context, entries, name } = this;
        const dep = new MultiEntryDependency(
			entries.map((e => new SingleEntryDependency(e)),
			name
        ));
        compilation.addEntry(context, dep, name, callback);
    }
);
```

## 入口配置处理 - 动态入口配置
动态入口配置也很简单，就是在执行完配置函数后，根据执行结果转换成单入口依赖或多入口依赖：
```js
// DynamicEntryPlugin.js
compiler.hooks.make.tapAsync(
    (compilation, callback) => {
        const addEntry = (entry, name) => {
            const dep = Array.isArray(entry) ?
                MultiEntryPlugin.createDependency(entry, name) :
                SingleEntryPlugin.createDependency(entry, name);
            return new Promise((resolve, reject) => {
                compilation.addEntry(this.context, dep, name, err => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        };
        Promise.resolve(this.entry()).then(entry => {
            addEntry(entry, "main").then(() => callback(), callback);
        });
    }
);
```

## 解析入口依赖
经过上面处理后，不同的入口配置就转换成为了`依赖`，接下来就开始编译器`Compilation`的工作。`Compilation`的作用就是递归解析依赖，从而获取所有需要打包的文件，所以它的工作原理基本上就是`添加依赖 -> 解析依赖模块 -> 得到该模块的其他依赖 -> 添加依赖`这么一个循环。`Compilation`中添加入口依赖的函数就是`addEntry`。

函数首先将入口依赖添加到`_preparedEntrypoints`中，这个数组在输出文件时使用，往数组添加几个入口依赖，就输出几个文件，输出的代码我们在后面文章分析：
- string: 有一个单入口依赖`SingleEntryDependency`，输出一个文件
- array: 有一个多入口依赖`MultiEntryDependency`，输出一个文件
- object: 有多少个依赖，输出多少个文件
```js
// Compilation.js
function addEntry(context, entry, name, callback) {
    const slot = {
        name: name,
        request: entry.request,
        module: null
    };
    this._preparedEntrypoints.push(slot);
    this._addModuleChain(context, entry,
        (module) => { this.entries.push(module); },
        (err, module) => {
            return callback(null, module);
        }
    );
}
```

接着调用真正解析依赖的方法`_addModuleChain`，这段代码比较复杂，我们可以先忽略其中细节，看其中最重要的解析方法。

首先通过`dependencyFactories`拿到依赖对应的解析器，前面配置的依赖处理在这里派上用场了，所以如果依赖是`SingleEntryDependency`，这里的`moduleFactory`拿到的就是前面注册的`NormalModuleFactory`。`NormalModuleFactory`的执行原理我们后面再讲，现在只要知道它的作用是将依赖就转换为模块，最后就是构建模块然后递归处理依赖。
```js
// Compilation.js
function _addModuleChain(context, dependency, onModule, callback) {
    const Dep = /** @type {DepConstructor} */ (dependency.constructor);
    const moduleFactory = this.dependencyFactories.get(Dep);
    moduleFactory.create(
        {
            contextInfo: {
                issuer: "",
                compiler: this.compiler.name
            },
            context: context,
            dependencies: [dependency]
        },
        (err, module) => {
            // ...
            // 构建模块
            this.buildModule(module, false, null, null, err => {
                // 处理入口模块的依赖
                if (addModuleResult.dependencies) {
                    this.processModuleDependencies(module, err => {
                        if (err) return callback(err);
                        callback(null, module);
                    });
                } else {
                    return callback(null, module);
                }
            });
        }
    );
}
```

# 数组参数伪代码
由于Webpack的插件模式使代码跳跃性比较大，下面我们使用同步的伪代码来看数组形式的参数整个的入口运作流程，将上面的内容串起来：
```js
function compile() {
    // webpack.js 解析参数
    const context = path.resolve(__dirname)
    const entry = ['./src/foo', './src/bar']
    const name = 'main'

    // Compiler.js 创建编译器
    const compilation = new Compilation();
    const normalModuleFactory = new NormalModuleFactory();
    const multiModuleFactory = new MultiModuleFactory();

    // MultiEntryPlugin.js 注册解析器/创建依赖
    compilation.dependencyFactories.set(MultiEntryDependency, multiModuleFactory)
    compilation.dependencyFactories.set(SingleEntryDependency, normalModuleFactory)
    const dep = new MultiEntryDependency(
        entries.map((e => new SingleEntryDependency(e)),
        name
    ));

    // Compilation.js 解析依赖
    const multiModuleFactory = compilation.dependencyFactories.get(dep)
    // 解析出模块
    const multiModule = multiModuleFactory.create(context, dependency)
    // 构建模块
    multiModule.buildModule()
    // 处理入口模块的依赖
    multiModule.dependencies.forEach((singleEntryDependency) => {
        const normalModuleFactory = compilation.dependencyFactories.get(singleEntryDependency)
        // 解析出模块
        const normalModule = normalModuleFactory.create(context, dependency)
        normalModule.buildModule()
        // 继续循环解析依赖...
        normalModule..dependencies.forEach(...)
    })
    // 构建完成打包输出...
}
```
