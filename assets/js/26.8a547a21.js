(window.webpackJsonp=window.webpackJsonp||[]).push([[26],{293:function(s,a,t){"use strict";t.r(a);var n=t(4),e=Object(n.a)({},(function(){var s=this,a=s.$createElement,t=s._self._c||a;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h1",{attrs:{id:"npm入门-package-json"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#npm入门-package-json"}},[s._v("#")]),s._v(" npm入门-package.json")]),s._v(" "),t("h1",{attrs:{id:"为什么要有package-json"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#为什么要有package-json"}},[s._v("#")]),s._v(" 为什么要有package.json")]),s._v(" "),t("blockquote",[t("p",[s._v("The best way to manage locally installed npm packages is to create a package.json file.")])]),s._v(" "),t("p",[s._v("package.json文件可以做到：")]),s._v(" "),t("ul",[t("li",[s._v("描述项目依赖的三方包及相应版本")]),s._v(" "),t("li",[s._v("让其他开发者快速构建本项目依赖环境")])]),s._v(" "),t("h1",{attrs:{id:"构建项目"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#构建项目"}},[s._v("#")]),s._v(" 构建项目")]),s._v(" "),t("h2",{attrs:{id:"第一步：初始化项目"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#第一步：初始化项目"}},[s._v("#")]),s._v(" 第一步：初始化项目")]),s._v(" "),t("p",[s._v("执行 npm init 命令后会在当前目录下新建package.json文件")]),s._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("# 初始化项目\n$ npm init\n# 使用默认配置初始化项目\n$ npm init --yes\n")])])]),t("p",[t("img",{attrs:{src:"/qn/content/FpoQYEiiZF-pZOEPzzlrt4-LCnzV",alt:"e6299a7af554a46bcf3b7a7a93e7254.png"}}),s._v('\n一个package.json必须包含"name"和"version"属性')]),s._v(" "),t("h2",{attrs:{id:"第二步：引入项目依赖三方包"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#第二步：引入项目依赖三方包"}},[s._v("#")]),s._v(" 第二步：引入项目依赖三方包")]),s._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("# 引入jquery\n$ npm install jquery\n")])])]),t("p",[s._v("运行成功后，可以看到package.json中多了一项dependencies属性，该属性描述了发布环境中项目所依赖的第三方包\n当项目所依赖的第三方包多了，node_modules目录也会变得很庞大，有了package.json给其他开发者使用或项目发布时就不需要上传node_modules，可以通过npm install命令让npm根据package.json的配置自动安装好项目依赖")]),s._v(" "),t("h1",{attrs:{id:"开发依赖-vs-发布依赖"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#开发依赖-vs-发布依赖"}},[s._v("#")]),s._v(" 开发依赖 vs 发布依赖")]),s._v(" "),t("h3",{attrs:{id:"为什么要区分"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#为什么要区分"}},[s._v("#")]),s._v(" 为什么要区分")]),s._v(" "),t("p",[s._v("前面在安装第三方包时，直接使用了 npm install <package_name>，效果是在当前目录下的node_module/下成功下载了所需的依赖，并在package.json的dependencies中添加了这个包。但是有时候我们所依赖的包仅在开发或测试时候才会用到，并不想在发布时候也一并安装，例如测试相关包或编译转换相关的包等，此时我们就可以用到devDependencies这个属性：")]),s._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("# 这个包将在开发和发布都用到\n$ npm install <package_name> --save\n# 这个包仅在发布用到\n$ npm install <package_name> --save-dev\n")])])]),t("h3",{attrs:{id:"实践使用babel"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#实践使用babel"}},[s._v("#")]),s._v(" 实践使用babel")]),s._v(" "),t("p",[s._v("目前大多数浏览器对es6语法支持不够，如果要使用es6语法，就需将其转换为浏览器支持更好的es5语法，"),t("a",{attrs:{href:"https://babeljs.io/",target:"_blank",rel:"noopener noreferrer"}},[s._v("babel"),t("OutboundLink")],1),s._v("可以做到，但是我们一般仅在开发时用es6语法，项目上线会将其用babel打包成es5语法的js，所以，babel依赖仅应该存在于devDependencies中")]),s._v(" "),t("ul",[t("li",[s._v("安装babel开发依赖 和 jquery生产依赖")])]),s._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("# 安装babel命令行工具和编译工具\n$ npm install --save-dev babel-cli babel-preset-env\n# 安装jquery\n$ npm install jquery\n")])])]),t("ul",[t("li",[s._v("在当前目录新建babel配置，一个.babelrc文件")])]),s._v(" "),t("div",{staticClass:"language-json extra-class"},[t("pre",{pre:!0,attrs:{class:"language-json"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"presets"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"env"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])])]),t("ul",[t("li",[s._v("在当前目录新建一个main.js")])]),s._v(" "),t("div",{staticClass:"language-js extra-class"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("map")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token parameter"}},[s._v("n")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v(" n "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("**")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),t("ul",[t("li",[s._v("运行babel转换器，将main.js转换成浏览器可运行的es5语法到dist/目录下的main.js")])]),s._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("# 执行转换编译\n$ .\\node_modules\\.bin\\babel .\\main.js -d dist\n")])])]),t("ul",[t("li",[s._v("执行后dist/下的main.js为浏览器可兼容的js")])]),s._v(" "),t("div",{staticClass:"language-js extra-class"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"use strict"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("map")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token parameter"}},[s._v("n")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("return")]),s._v(" Math"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("pow")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),t("h3",{attrs:{id:"可以看到安装完成后，package-json中会包括"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#可以看到安装完成后，package-json中会包括"}},[s._v("#")]),s._v(" 可以看到安装完成后，package.json中会包括")]),s._v(" "),t("div",{staticClass:"language-json extra-class"},[t("pre",{pre:!0,attrs:{class:"language-json"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"devDependencies"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"babel-cli"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"^6.26.0"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"babel-preset-env"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"^1.7.0"')]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"dependencies"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"jquery"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"^3.3.1"')]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])])]),t("h3",{attrs:{id:"将package-json复制到另外两个目录，分别执行"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#将package-json复制到另外两个目录，分别执行"}},[s._v("#")]),s._v(" 将package.json复制到另外两个目录，分别执行")]),s._v(" "),t("div",{staticClass:"language-shell extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[s._v("# 安装所有依赖\n$ npm install\n# 仅安装dependencies依赖\n$ npm install --production\n")])])]),t("p",[s._v("可在node_module/下看到npm会自动区分需要下载安装的依赖")]),s._v(" "),t("h1",{attrs:{id:"参数描述"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#参数描述"}},[s._v("#")]),s._v(" 参数描述")]),s._v(" "),t("ul",[t("li",[s._v("name: 项目名，必须小写，不含空格，单词间用“-”或“_”分割")]),s._v(" "),t("li",[s._v("version: 项目版本，格式为x.x.x，遵循"),t("a",{attrs:{href:"https://semver.org/lang/zh-CN/",target:"_blank",rel:"noopener noreferrer"}},[s._v("语义化版本控制规范"),t("OutboundLink")],1)]),s._v(" "),t("li",[s._v("description：项目描述")])]),s._v(" "),t("blockquote",[t("p",[s._v("If there is no description field in the package.json, npm uses the first line of the README.md or README instead. The description helps people find your package when searching npm, so it's definitely useful to make a custom description in the package.json to make your package easier to find.")])]),s._v(" "),t("ul",[t("li",[s._v("main: 默认启动js文件")]),s._v(" "),t("li",[s._v("scripts：npm script 命令")]),s._v(" "),t("li",[s._v("keywords: 项目关键字，数组")]),s._v(" "),t("li",[s._v("author: 项目作者")]),s._v(" "),t("li",[s._v("license: 项目协议")]),s._v(" "),t("li",[s._v("bugs: 项目issuse及bug页")]),s._v(" "),t("li",[s._v("homepage: 项目主页")]),s._v(" "),t("li",[s._v("dependencies: 发布环境下项目依赖包")]),s._v(" "),t("li",[s._v("devDependencies: 开发/测试环境下项目依赖包")])]),s._v(" "),t("h1",{attrs:{id:"清单例子"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#清单例子"}},[s._v("#")]),s._v(" 清单例子")]),s._v(" "),t("div",{staticClass:"language-json extra-class"},[t("pre",{pre:!0,attrs:{class:"language-json"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"name"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"init"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"version"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"1.0.0"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"description"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('""')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"main"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"index.js"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"scripts"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"test"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"echo \\"Error: no test specified\\" && exit 1"')]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"keywords"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"author"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('""')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"license"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"ISC"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"devDependencies"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"babel-cli"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"^6.26.0"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"babel-preset-env"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"^1.7.0"')]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"dependencies"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"jquery"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"^3.3.1"')]),s._v("\n  "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n")])])]),t("h1",{attrs:{id:"参考资料"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#参考资料"}},[s._v("#")]),s._v(" 参考资料")]),s._v(" "),t("p",[t("a",{attrs:{href:"https://www.npmjs.com.cn/files/package.json/",target:"_blank",rel:"noopener noreferrer"}},[s._v("package.json详细介绍"),t("OutboundLink")],1),s._v(" "),t("a",{attrs:{href:"https://semver.org/lang/zh-CN/",target:"_blank",rel:"noopener noreferrer"}},[s._v("语义化版本控制规范"),t("OutboundLink")],1)])])}),[],!1,null,null,null);a.default=e.exports}}]);