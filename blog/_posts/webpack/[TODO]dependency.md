# 依赖
依赖处理是文件打包的第一个阶段。

* 入口依赖 -> 
* AMD -> AMDPlugin
* System -> SystemPlugin
* Require.ensure -> RequireEnsurePlugin
* Import (分包异步加载 module) -> ImportPlugin

## 类
* Module: 代表一个模块
* NormalModule: 
* NormalModuleFactory: 

* HarmonyDetectionParserPlugin: `parser.hooks.program`执行，用于检测文件是否是以`esm`来写。
* UseStrictPlugin: `parser.hooks.program`执行，如果有`"use strict"`开头，删除它并标记。

* BasicEvaluatedExpression: 

## Parse 
用于解析文件内容，给后续分析依赖提供数据。在`NormalModuleFactory.hooks.resolver`时创建，在创建一个Module时，需要给Module传入一个Parse，如果没有创建过Parse就在这里创建。
### Hook
* `hooks.program`在解析完ast后执行。



## JavascriptModulesPlugin:
创建Parse
### 文件类型对应的Paser
"javascript/auto": "JavascriptModulesPlugin"
"javascript/dynamic": "JavascriptModulesPlugin"
"javascript/esm": "JavascriptModulesPlugin"
"json": "JsonModulesPlugin"
"webassembly/experimental": "WebAssemblyModulesPlugin"

## CommonJsRequireDependencyParserPlugin

## 依赖种类



# 参考文章
[AST在线编译查看](https://astexplorer.net/)