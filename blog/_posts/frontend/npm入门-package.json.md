---
date: 2018-11-7
tag: 
  - npm
  - web
author: kukiiu
location: ShenZhen  
---
# npm入门-package.json

# 为什么要有package.json
> The best way to manage locally installed npm packages is to create a package.json file.

package.json文件可以做到：
* 描述项目依赖的三方包及相应版本
* 让其他开发者快速构建本项目依赖环境

# 构建项目
## 第一步：初始化项目
执行 npm init 命令后会在当前目录下新建package.json文件
```shell
# 初始化项目
$ npm init
# 使用默认配置初始化项目
$ npm init --yes
```
![e6299a7af554a46bcf3b7a7a93e7254.png](/qn/content/FpoQYEiiZF-pZOEPzzlrt4-LCnzV)
一个package.json必须包含"name"和"version"属性

## 第二步：引入项目依赖三方包
```shell
# 引入jquery
$ npm install jquery
```
运行成功后，可以看到package.json中多了一项dependencies属性，该属性描述了发布环境中项目所依赖的第三方包
当项目所依赖的第三方包多了，node_modules目录也会变得很庞大，有了package.json给其他开发者使用或项目发布时就不需要上传node_modules，可以通过npm install命令让npm根据package.json的配置自动安装好项目依赖

# 开发依赖 vs 发布依赖
### 为什么要区分
前面在安装第三方包时，直接使用了 npm install <package_name>，效果是在当前目录下的node_module/下成功下载了所需的依赖，并在package.json的dependencies中添加了这个包。但是有时候我们所依赖的包仅在开发或测试时候才会用到，并不想在发布时候也一并安装，例如测试相关包或编译转换相关的包等，此时我们就可以用到devDependencies这个属性：
```shell
# 这个包将在开发和发布都用到
$ npm install <package_name> --save
# 这个包仅在发布用到
$ npm install <package_name> --save-dev
```
### 实践使用babel
目前大多数浏览器对es6语法支持不够，如果要使用es6语法，就需将其转换为浏览器支持更好的es5语法，[babel](https://babeljs.io/)可以做到，但是我们一般仅在开发时用es6语法，项目上线会将其用babel打包成es5语法的js，所以，babel依赖仅应该存在于devDependencies中
* 安装babel开发依赖 和 jquery生产依赖
```shell
# 安装babel命令行工具和编译工具
$ npm install --save-dev babel-cli babel-preset-env
# 安装jquery
$ npm install jquery
```
* 在当前目录新建babel配置，一个.babelrc文件
```json
{
    "presets": ["env"]
}
```
* 在当前目录新建一个main.js
```js
[1, 2, 3].map((n) => n ** 2);
```
* 运行babel转换器，将main.js转换成浏览器可运行的es5语法到dist/目录下的main.js
```shell
# 执行转换编译
$ .\node_modules\.bin\babel .\main.js -d dist
```
* 执行后dist/下的main.js为浏览器可兼容的js
```js
"use strict";

[1, 2, 3].map(function (n) {
  return Math.pow(n, 2);
});
```
### 可以看到安装完成后，package.json中会包括
```json
{
  "devDependencies": {
    "babel-cli": "^6.26.0",
    "babel-preset-env": "^1.7.0"
  },
  "dependencies": {
    "jquery": "^3.3.1"
  }
}
```
### 将package.json复制到另外两个目录，分别执行
``` shell
# 安装所有依赖
$ npm install
# 仅安装dependencies依赖
$ npm install --production
```
可在node_module/下看到npm会自动区分需要下载安装的依赖


# 参数描述
* name: 项目名，必须小写，不含空格，单词间用“-”或“_”分割
* version: 项目版本，格式为x.x.x，遵循[语义化版本控制规范](https://semver.org/lang/zh-CN/)
* description：项目描述
> If there is no description field in the package.json, npm uses the first line of the README.md or README instead. The description helps people find your package when searching npm, so it's definitely useful to make a custom description in the package.json to make your package easier to find. 
* main: 默认启动js文件
* scripts：npm script 命令
* keywords: 项目关键字，数组
* author: 项目作者
* license: 项目协议
* bugs: 项目issuse及bug页
* homepage: 项目主页
* dependencies: 发布环境下项目依赖包
* devDependencies: 开发/测试环境下项目依赖包

# 清单例子
```json
{
  "name": "init",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "babel-cli": "^6.26.0",
    "babel-preset-env": "^1.7.0"
  },
  "dependencies": {
    "jquery": "^3.3.1"
  }
}

```

# 参考资料
[package.json详细介绍](https://www.npmjs.com.cn/files/package.json/)
[语义化版本控制规范](https://semver.org/lang/zh-CN/)