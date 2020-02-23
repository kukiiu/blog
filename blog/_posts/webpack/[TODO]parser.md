# 模块解析器

## 模块解析
`JavascriptModulesPlugin`添加了解析js的解析器

### 文件类型对应的Paser
"javascript/auto": "JavascriptModulesPlugin"
"javascript/dynamic": "JavascriptModulesPlugin"
"javascript/esm": "JavascriptModulesPlugin"
"json": "JsonModulesPlugin"
"webassembly/experimental": "WebAssemblyModulesPlugin"

### Parse 
用于解析文件内容，给后续分析依赖提供数据。在`NormalModuleFactory.hooks.resolver`时创建，在创建一个Module时，需要给Module传入一个Parse，如果没有创建过Parse就在这里创建。


# 优化
## noParser
## parser config

# 参考文章
[AST在线编译查看](https://astexplorer.net/)