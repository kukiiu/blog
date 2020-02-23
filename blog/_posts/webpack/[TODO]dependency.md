# 依赖
依赖处理是文件打包的第一个阶段。

- 依赖的产生
- 依赖的种类
- 依赖的作用
- 与模块的关系
- 如何处理依赖

## 类
* Dependency
    - ContextDependency
        - ImportContextDependency => ContextModuleFactory
    - ModuleDependency
        - SingleEntryDependency => NormalModuleFactory
        - ImportDependency => NormalModuleFactory
    - NullDependency
        - JsonExportsDependency => 
    - MultiEntryDependency => MultiModuleFactory
    - DllEntryDependency
    - AMDRequireArrayDependency

* dep => factory

* NormalModuleFactory: 解析依赖所需要的loader及依赖的详细路径
    - type是干嘛的？？？？
    - ContextModuleFactory

# tmp
* 入口依赖 -> 
* AMD -> AMDPlugin
* System -> SystemPlugin
* Require.ensure -> RequireEnsurePlugin
* Import (分包异步加载 module) -> ImportPlugin

* HarmonyDetectionParserPlugin: `parser.hooks.program`执行，用于检测文件是否是以`esm`来写。
* UseStrictPlugin: `parser.hooks.program`执行，如果有`"use strict"`开头，删除它并标记。

* BasicEvaluatedExpression: 



# QA
ModuleReason，reasons是什么 

## CommonJsRequireDependencyParserPlugin

