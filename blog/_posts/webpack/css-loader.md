# Webpack处理css
很久很久以前我们在写页面时，通常将css单独写成文件引入，有时也直接在html里写css非常方便，这时页面也不多动效也不需要，写几个页面一把梭就能应付。

渐渐地网页成了大众获取信息的主要方式，这时的网站信息也越来越丰富，对网页的质量要求越来越高，这一时期一些前端自动化构建工具慢慢崭露头角，css预处理器也进入前端的视线。这时的前端已经不是以前的单兵作战的时代了，而随之带来的复杂性也挺让人头疼，写个网站前要纠结用`sass`还是`less`，选好了还要配置一番才能用，但是还好css的语法没有太大改变。

得益于移动端的发展，前端项目的复杂性日益增长，单页网站慢慢做成了像APP一样复杂。项目复杂了工具得要跟的上啊，于是前端涌现出了各种各样的框架。`React`等解决了大型项目的组织和复用问题，`Webpack`等提供了项目从开发到发布的配套环境，有了这些工具支持，慢慢地前端发展了自己的一套完整工作体系。这一阶段我们的思维模式发生了很大转变，慢慢把css也带跑偏：
- React的组件化模式使得`css-in-js`逐渐走上舞台；
- Webpack`一切皆模块`的中心思想改变了我们传统的开发流程，从入口文件开始构建出一套可在浏览器运行的网站，直接抹去了前端复杂的多样性，甚至促进了`CSS Modules`的发展；

个人感觉`css-in-js`使用起来还是感觉有点别扭，但是`CSS Modules`就太方便了，借助Webpack我们并不需要去使用`style`标签引入css，还是同样的写css文件，js中直接引入css当作变量使用。那么Webpack是怎么引入css文件并解析成变量呢？css最后又是如何作用在元素上呢？

## 环境准备
- 初始化项目：`yarn init -y`
- 安装依赖：`yarn add webpack webpack-cli html-webpack-plugin`
- 创建目录：`src`，`loader`
- 创建Webpack配置文件壳子：
```js
/* ./webpack.config.js */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    // 方便查看输出内容
    mode: 'development',
    // 方便查看输出内容
    devtool: false,
    // 入口文件
    entry: './src/index.js',
    // 让webpack优先使用/loader目录下的loader
    resolveLoader: {
      modules: [path.resolve(__dirname, "loader"), "node_modules"]
    },
    // loader解析规则
    module: {
        rules: [ { test: /\.css$/, use: 'css-loader' } ]
    },
    // 输出一个html
    plugins: [ new HtmlWebpackPlugin() ],
};
```
- 新建一个css文件，我们将会把这个文件打包成可以在浏览器运行
```css
/* ./src/foo.css */
body {
    background-color: yellow;
}
```
- 新建一个js文件导入css
```js
/* ./src/index.css */
require('./foo.css')
```

## 将css文件注入网页
我们知道webpack本身是不支持解析css文件的，所以如果我们在js中使用`require('./foo.css)`会返回语法解析错误。我们需要告诉webpack如何去解析css文件内容，就需要一个loader来将css转换为webpack能识别的js代码进行解析。

浏览器加载css一共有三种方法（内联样式/内部样式表/外部样式表），所以我们最终的代码中css一定也是以这三种方式加载，其中最简单的方法就是把css文件内容直接转成内部样式表，我们新建一个loader来试试看，既然是处理css那么我们就先取名为`css-loader`吧：
```js
/* ./loader/css-loader */
module.exports = function loader(source) {
    // 将css文件特殊字符转码
    let cssCode = JSON.stringify(source);
    var source = `var style = document.createElement("style");`
        + `style.type = "text/css";`
        + `style.innerHTML = ${cssCode};`
        + `document.head.appendChild(style);`
    return source
}
```
运行打包后，会输出一个html文件，打开就可以看到样式已经被插入到`<head>`中了，这段代码进过webpack翻译后大致变成下面的样子:
```js
// 经过loader转换后的foo.css输出
function fooCss() {
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = "body {background-color: yellow; }"
    document.head.appendChild(style);
}
// 经过编译后的index.js输出
fooCss()
```
我们已经用最简单方式完成了css文件打包输出的功能。当然官方的loader肯定没那么简单，下面我们来分析源码学习一下。

# css-loader 编译CSS
`css-loader`用于解析css文件，输出为一段js代码，我们可以看到上面的例子几个缺点：
- 如果遇到css中加载图片文件就搞不了，因为上面只是简单的将css赋值给标签，如果webpack没有解析图片路径，那么图片不会输出到打包目录，css也就找不到图片文件。
- 直接写css，就像写js没有用babel一样，功能弱兼容性还差。

于是`css-loader`使用了css届的babel - `postcss`，不仅能帮我们支持css模块化，搭配相应的插件想怎么处理css都行，没有命名冲突的烦恼简直是命名洁癖患者的福音，下面我们看看它到底做了什么：

## Step1: 插件加载
首先第一步做了参数解析，用于加载postcss插件，插件按顺序执行处理css文件：
```js
module.exports = function loader(content, map, meta) {
    const options = getOptions(this) || {};
    const callback = this.async();
    const plugins = []
    // 开启postcss-modules
    if (options.modules) {
        // 用于支持@value语法
        plugins.push(modulesValues);
        // 用于支持composes import语法
        plugins.push(extractImports())
        // 用于标记局部css
        plugins.push(localByDefault())
        // 用于导出局部css为变量
        plugins.push(modulesScope())
    }
    // 将icss语法转为普通css语法，就是解析:import，:export等标签
    plugins.push(icssParser());
    // 用于解析@import语法
    if (options.import !== false) {
        plugins.push(importParser({}));
    }
    // 用于解析url语法
    if (options.url !== false) {
        plugins.push(urlParser({}));
    }

    // Step2 ...
}
```
### postcss-modules-values
`modulesValues`是用于支持css变量，还会导出这个变量：
```css
/* from */
@value primary: #BF4040;
.text-primary {
  color: primary;
}

/* to */
.text-primary {
  color: #BF4040;
}
:export {
  primary: #BF4040;
}
```

### postcss-modules-extract-imports
解析`composes import`语法：
```css
/* from */
.foo {
    composes: my_red from "./colors.css";
}

/* to */
:import("./colors.css") {
  i__imported_my_red_0: my_red;
}
.foo {
    composes: i__imported_my_red_0;
}
```

### postcss-modules-local-by-default
使用`CSS Modules`后，默认我们的css都是全局唯一的，`localByDefault`会把我们的css选择器加上`:local`标签，如果需要将某些CSS标记为全局时，需要我们给选择器手动加上`:global`标签
```css
/* from */
:global(.foo) {}
.bar {}

/* to */
.foo {}
:local(.bar) {}
```

### postcss-modules-scope
用于解析`:local`标签，将其重命名为全局唯一，然后导出这个选择器：
```css
/* from */
.foo {
    color: red;
}
/* to */
._Users_demo_src_a__foo {
    color: red;
}
:export {
  foo: _Users_demo_src_a__foo;
}
```

### icssParser
其中icss语法是一种中间语法，提供了两个语法`:import`和`:export`用于支持`CSS Modules`依赖解析，通常这对我们来说是透明的。这里的`icssParser`将解析这两个标签，输出不带这两个标签的css和解析后的`import/export`数据：
```css
/* from */
._Users_demo_src_a__foo {
    color: red;
}
:export {
  foo: _Users_demo_src_a__foo;
}

/* to */
._Users_demo_src_a__foo {
    color: red;
}
/* 额外数据: const exports = [{foo: _Users_demo_src_a__foo}] */
```

## Step2: 执行postCss
执行postCss就是按顺序执行上面的一堆插件，输出为标准css字符串及依赖解析结果。这里会对依赖结果进行分析，转换成一串js字符串输出给下一个loader：
```js
module.exports = function loader(content, map, meta) {
    // Step1 ...

    postcss(plugins)
        .process(content, {
            from: this.remainingRequest.split('!').pop(),
            to: this.currentRequest.split('!').pop(),
            map: false,
        })
        .then((result) => {
            const imports = result.messages.filter(m => m.type === 'import').map(m => m.value);
            const exports = result.messages.filter(m => m.type === 'export').map(m => m.value);
            const replacers = result.messages.filter(m => m.type === 'replacer').map(m => m.value);
            // 转换成js代码，给webpack处理依赖
            const importCode = getImportCode(this, imports, 'full', false, undefined, false);
            const moduleCode = getModuleCode(this, result, 'full', false, replacers);
            const exportCode = getExportCode(this, exports, 'full', replacers, '', false);
            const jsCode = [importCode, moduleCode, exportCode].join('')
            callback(null, jsCode)
        })
}
```

### 举个例子
```css
@value my_red: * from './colors.css';
.foo {
    color: my_red;
}
```
转换后的js如下，相当于css文件在这里转成了js文件，最后Webpack拿到下面的js继续解析依赖，这样Webpack就能正确解析到依赖的文件了。
```js
// Imports
var ___CSS_LOADER_API_IMPORT___ = require("../loader/runtime/api.js");
var ___CSS_LOADER_ICSS_IMPORT_0___ = require("-!../loader/css-loader.js??ref--4-0!./colors.css");
exports = ___CSS_LOADER_API_IMPORT___(false);
exports.i(___CSS_LOADER_ICSS_IMPORT_0___, "", true);
// Module
exports.push([module.id, "._Users_demo_src_a__foo {\n    color: " + ___CSS_LOADER_ICSS_IMPORT_0___.locals["my_red"] + ";\n}\n", ""]);
// Exports
exports.locals = {
        "my_red": "" + ___CSS_LOADER_ICSS_IMPORT_0___.locals["my_red"] + "",
        "foo": "_Users_demo_src_a__foo"
};
module.exports = exports;
```

### css依赖
在上面的例子中我们可以到最终依赖的`./color.css`文件被转换成了`require("-!../loader/css-loader.js??ref--4-0!./colors.css")`，我们可以得到以下信息：
- 输出的js文件将会被Webpack继续解析`require`的文件，所以Webpack将会继续解析`./colors.css`
- `-!`前缀说明解析时忽略`normalLoader`和`preLoader`，所以将使用`../loader/css-loader.js`及`postLoader`解析该文件。
- `??ref--4-0`后缀说明要用全局定义的某个配置作为`css-loader`的选项，这里的`ref--4-0`配置就是全局`css-loader`的配置

css依赖的解析函数如下，`importLoaders`是我们配置的值，表示css被`css-loader`处理前的`loader`数量，经过如下处理后，依赖的css便只需要被`css-loader`及前面的`loader`处理：
```js
function getImportPrefix(loaderContext, importLoaders) {
    if (importLoaders === false) {
      return '';
    }
    // 除了css-loader外，解析还需要的loader数量
    const numberImportedLoaders = parseInt(importLoaders, 10) || 0;
    // loaderContext.loaders: 解析css的所有loader数量
    // loaderContext.loaderIndex: 当前css-loader是第几个解析的
    const loadersRequest = loaderContext.loaders
      .slice(
        loaderContext.loaderIndex,
        loaderContext.loaderIndex + 1 + numberImportedLoaders
      )
      .map((x) => x.request)
      .join('!');
    return `-!${loadersRequest}!`;
}
```

# style-loader 输出CSS
经过`css-loader`处理后，我们就需要把处理好的css文件输出到html上了。

## 直接导出到html
由上面分析知道，这里拿到的`source`是一个js字符串，而这串js中导出了一个`exports.toString()`函数可以获取到完整的css，那我们就直接把这串css输出到html。

另外这个loader的返回值会导出给`require`这个css的文件使用，而`exports.locals`里则放了css导出的所有变量，所以我们可以在js中使用这些变量：
```js
module.exports = function (source) {
    return `${source}
        ${`
            var style = document.createElement("style");
            style.type = "text/css";
            style.innerHTML = exports.toString()
            document.head.appendChild(style);
        `}
        module.exports = exports.locals;
    `
};
```
于是我们可以在js中写如下代码，这里将使用上面导出的css变量，变量的值代表选择器的值，这就是css能在js中使用的`CSS Modules`原理了：
```js
const styles = require('./a.foo')
const div = document.createElement('div')
div.innerHTML = `<span class='${styles.foo}'>ME</span><div class='${styles.bar}'>YOU</div>`
document.body.appendChild(div)
```

## 更好的导出方法 - 巧用pitch
当然上面的方法是比较直接的，官方使用了`pitch`来更优雅地解决了这个问题。使用`pitch`的拦截功能直接结束本次文件解析，并将css以`require`的方式重新引入，使用`!!`配合参数，使得下一次解析不需要经过`style-loader`：
```js
module.exports.pitch = function (request) {
    // Webpack会继续解析返回的js，这次将只使用css-loader去解析css
    // require("!!../loader/css-loader.js??ref--4-0!./colors.css")
    const req = `${`var content = require(${loaderUtils.stringifyRequest(this, `!!${request}`)});`}`
    
    // 在这里可以拿到css-loader解析后的内容，直接输出到html
    const styles = `${`
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerHTML = content.toString()
        document.head.appendChild(style);
    `}`

    // 导出css选择器的变量给js使用
    const exp = `module.exports = content.locals ? content.locals : {};`
    return req + styles + exp;
};
```

# less-loader 编译less
除了使用上面的`postcss`，我们还可以无缝对接`less`等解析器：
```js
module.exports = function(source) {
    const callback = this.async()
    const options = {
      // less解析@import时的参考路径
      filename = this.resource;
    }
    // 调用less解析
    less.render(source, options).then(({ css, map, imports }) => {
        // 由于less的依赖不是webpack解析的，所以要告诉webpack监听这些文件
        imports.forEach(this.addDependency, this);
        // 把解析好的css传给下一个loader
        callback(null, css)
    })
}
```

解析依赖时，不像`css-loader`是将`import`转成了`require`给Webpack去解析，`less`解析器是自己解析依赖。就是说如果使用了`@import './colors.css`，less解析器输出的结果已经不含依赖了。

# 参考资料
[loader及其优化](https://juejin.im/post/5e40161a6fb9a07cce74d3db)

[less-loader](https://webpack.js.org/loaders/less-loader/)

[css-loader](https://webpack.docschina.org/loaders/css-loader/)

[css-modules](https://github.com/css-modules)

[icss](https://github.com/css-modules/icss)
