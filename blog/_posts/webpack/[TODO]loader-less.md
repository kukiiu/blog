# Webpack处理css
很久很久以前我们在写页面时，通常将css单独写成文件引入，有时也直接在html里写css非常方便，这时页面也不多动效也不需要，写几个页面一把梭就能应付。

渐渐地网页成了大众获取信息的主要方式，这时的网站信息也越来越丰富，对网页的质量要求越来越高，这一时期一些前端自动化构建工具慢慢崭露头角，css预处理器也进入前端的视线。这时的前端已经不是以前的单兵作战的时代了，而随之带来的复杂性也挺让人头疼，写个网站前要纠结用`sass`还是`less`，选好了还要配置一番才能用，但是还好css的语法没有太大改变。

得益于移动端的发展，前端项目的复杂性日益增长，单页网站慢慢做成了像APP一样复杂。项目复杂了工具得要跟的上啊，于是`React`等框架解决了大型项目的组织和复用问题，`Webpack`等框架提供了项目从开发到发布的配套环境，有了这些工具支持，慢慢地前端发展了自己的一套完整工作体系。有意思的是这里发生了两个改变了传统模式的思维：
- React的组件化模式使得`css-in-js`逐渐走上舞台；
- Webpack`一切皆模块`的中心思想改变了我们传统的开发流程，从入口文件开始构建出一套可在浏览器运行的网站，直接抹去了前端多样性的复杂性，甚至促进了`CSS Modules`的发展；

个人感觉`css-in-js`使用起来还是感觉有点啰嗦，但是`CSS Modules`就太方便了，借助Webpack我们并不需要去使用`style`标签引入css，还是同样的写css文件，js中直接引入css当作变量使用。那么Webpack是怎么引入css文件并解析成变量呢？css最后又是如何作用在元素上呢？下面我们一起来探究一番：

## 环境准备

# 将css文件注入网页
我们知道浏览器加载css一共有三种方法（内联样式/内部样式表/外部样式表），所以我们最终的代码中css一定也是以这三种方式加载：

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
    entry: './src/a.css',
    // 让webpack优先使用/loader目录下的loader
    resolveLoader: {
      modules: [path.resolve(__dirname, "loader"), "node_modules"]
    },
    // loader解析规则
    module: {
        rules: [ { test: /\.css$/, use: 'style-loader' } ]
    },
    // 输出一个html
    plugins: [ new HtmlWebpackPlugin() ],
};
```
- 新建一个css文件，我们将会把这个文件打包成可以在浏览器运行
```css
/* ./src/a.css */
body {
    background-color: yellow;
}
```

## 使用内部样式表
我们新建一个`style-loader`来完成将css文件转换成内部样式表：
```js
/* ./loader/style-loader */
module.exports = function loader(source) {
    // 将css文件特殊字符转码
    let cssCode = JSON.stringify(content);
    var source = `var style = document.createElement("style");`
        + `style.type = "text/css";`
        + `style.innerHTML = ${cssCode};`
        + `document.head.appendChild(style);`
    return source
}
```
运行打包后，会输出一个html文件，打开就可以看到样式已经被插入到`<head>`中了，我们已经用最简单方式完成了css文件打包输出的功能。当然官方的loader肯定没那么简单，下面我们来分析官方的源码学习一下。



# 参考资料
[less-loader](https://webpack.js.org/loaders/less-loader/)









# less文件的处理过程

loader: "style-loader" // creates style nodes from JS strings

loader: "css-loader" // translates CSS into CommonJS

loader: "less-loader" // compiles Less to CSS


## webpack resolver
webpack provides an advanced mechanism to resolve files. The less-loader applies a Less plugin that passes all queries to the webpack resolver. Thus you can import your Less modules from node_modules. Just prepend them with a ~ which tells webpack to look up the modules.
@import '~bootstrap/less/bootstrap';
It's important to only prepend it with ~, because ~/ resolves to the home-directory. webpack needs to distinguish between bootstrap and ~bootstrap, because CSS and Less files have no special syntax for importing relative files. Writing @import "file" is the same as @import "./file";

## Non-Less imports
Using webpack's resolver, you can import any file type. You just need a loader that exports valid Less code. Often, you will also want to set the issuer condition to ensure that this rule is only applied on imports originating from Less files:
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        issuer: /\.less$/,
        use: [
          {
            loader: 'js-to-less-loader',
          },
        ],
      },
    ],
  },
};

## Less resolver
If you specify the paths option, the less-loader will not use webpack's resolver. Modules, that can't be resolved in the local folder, will be searched in the given paths. This is Less' default behavior. paths should be an array with absolute paths:
In this case, all webpack features like importing non-Less files or aliasing won't work of course.

webpack.config.js

module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              paths: [path.resolve(__dirname, 'node_modules')],
            },
          },
        ],
      },
    ],
  },
};