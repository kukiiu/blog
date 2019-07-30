<h1 align="center">Eslint 代码规则配置</h1>

<br>

## 代码检测工具发展
第一代: JSLint不可配置的JavaScript代码检测工具

第二代: JSHint和JSLint一样，但具有以下优势：1、可配置规则。2、社区支持度高。3、可定制结果报表

第三代: ESLint是利用AST处理规则，用Esprima解析代码，可扩展性强，可平滑支持es6和react

## ESLint 是什么
ESLint是一个开源的JavaScript代码检查工具，代码检查是一种静态的分析，常用于寻找有问题的模式或者代码，并且不依赖于具体的编码风格。对大多数编程语言来说都会有代码检查，一般来说编译程序会内置检查工具。

JavaScript是一个动态的弱类型语言，在开发中比较容易出错。因为没有编译程序，为了寻找JavaScript代码错误通常需要在执行过程中不断调试。像ESLint这样的可以让程序员在编码的过程中发现问题而不是在执行的过程中。

提供了以下功能：
* 检查JavaScript/TypeScript/JSX的语法错误
* 提示潜在的bug
* 一致的编码风格

## 常见的错误
* Uncaught TypeError: Cannot read property
```js
var foo;
foo.bar;
```
* TypeError: ‘undefined’ is not a function
```js
this.foo();
```
* Uncaught RangeError
```js
new Array(-1)
```
* Uncaught TypeError: Cannot set property
```js
var foo = undefined
foo.bar = 1
```

## ESLint解析器
- esprima(default)

- babel-eslint 
> https://github.com/babel/babel-eslint

使用babel-eslint解析器可以检查所有Babel支持的语法，有些Babel支持的新语法在默认解析器也支持，如果默认解析器支持项目里的语法，就没有必要使用

- @typescript/parse 
> https://www.npmjs.com/package/@typescript-eslint/parser#configuration

用于解析TypeScript语法, parserOptions与默认解析器有所不同

## 使用ESLint
```shell
# 安装
npm install eslint

# 初始化
eslint --init
```

eslintrc.json 配置
```js
{
    // 解析器类型 esprima(default) babel-eslint @typescript/parse
    parse: 'esprima',
    // 解析器配置参数
    parseOptions: {
        // 代码类型: script(default), module
        sourceType: "script",
        // es版本号, 默认为5，也可使用年份
        ecamVersion: 6,
        // es特征配置
        ecmaFeatures: {
            // 运行在全局作用域下使用return
            globalReturn: true,
            // 启用全局strict mode
            impliedStrict: true,
            // 启用JSX
            jsx: true
        }
        // 即使没有 babelrc 配置文件，也使用 babel-eslint 来解析
        requireConfigFile: false,
        // 仅允许 import export 语句出现在模块的顶层
        allowImportExportEverywhere: false
    }
    settings: {
        react: {                  
             version: 'detect' // React version. "detect" automatically picks the version you have installed.                                               
                                 // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.                                              
                                 // default to latest and warns if missing                                             
                                 // It will default to "detect" in the future                 
        }
    },
    // 以当前目录为根目录，不再向上查找 .eslintrc.js
    root: true,
    // 全局变量声明，true表示writeable, false表示readonly
    globals: {
        // 声明jQuery未全局变量
        '$': false // 
    },
    // 用于简化globals设置，一项env包括多个globals选项
    env: {
        browser: true,
        node: true,
        commonjs: true, // exports: true, global: false, module: false, require: false
        es6: true,
        jquery: true, // $: false, jQuery: false
        amd: true, // define: false, requier: false
    },
    plugins: [
        // ...
    ]
    extends: [
        // ...
    ]
    rules: [
        // ...
    ]
}
```

## 插件
因为官方规则只能检测标准JavaScript语法，如果写的是JSX或VUE，就需要插件支持检测，插件以eslint-plugin-开头
```js
{
    plugins: [
        "react", // eslint-plugin-react
        "vue", // eslint-plugin-vue
    ]
}
```

## 扩展
```js
{
    extends: [
        "eslint:recommended",
        "eslint-config-standard",
        "plugin:react/recommended",
    ]
}
```
* eslint:开头的是ESLint官方扩展，有两个： eslint:recommended, eslint:all
* npm扩展，规定必须以eslint-config-开头，否则无法找到，使用时可省略这个开头
* plugin:${pluginName}/${configName} 为插件+扩展形式引入，这种方式就不需要在plugins定义插件

## 规则设置
每一条规则第一个参数接受以下值：
- 'off'/ 0: 关闭规则
- 'warn' / 1: 开启warn级别的检测
- 'error' / 2: 开启error级别的检测

## 发布自己的扩展规则
- 需要将包命名为eslint-config-xxx
- package.json中peerDependencies指定eslint版本

## 开发自己的插件

```shell
# 安装插件Yeoman模板
npm install -g yo generator-eslint

# 创建模板
yo eslint:plugin

# 创建规则
yo eslint:rule
```

## 最佳配置
- airbnb style
- javascripte standard
- elsint-config-alloy

## 为什么不用TSLint
**Palantir将在2019年停止维护TSLint**

使用TSLint优点
* 不需要任何工具来协调AST格式之间的差异

使用TSLint缺点
* 将没办法复用围绕JavaScript构建的lint生态，如规则和自动修复等

## 名词参考
- TSLint: Palantir公司出的TS代码检查工具
- ESLint: JS代码检查工具
- typescript-eslint: 新的Eslint插件，处理TS
- typescript-eslint-parser: 旧的ESLint插件，处理TS

## 参考资料
[ESlint中文网](http://eslint.cn/)

[TypeScript ESLint 仓库](https://github.com/typescript-eslint/typescript-eslint)

[JavaScript项目Top10错误类型](https://rollbar.com/blog/top-10-javascript-errors/)

[TypeScript 解决了什么痛点 - 知乎](https://www.zhihu.com/question/308844713/answer/574423626)

[ESlint介绍](https://www.cnblogs.com/xiaohuochai/p/9076440.html)
