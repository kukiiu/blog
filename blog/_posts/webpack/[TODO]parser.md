# 模块解析器
# Js解析器 - 初识
Js解析器`Parser`是Webpack中最重要的工具之一，不同类型文件在经过`loader`处理后，将会被转换输出成为一串js字符串，Parser会将其转换为AST语法树，有了语法树就可以对代码为所欲为了，其中最重要的功能就是分析出这段代码依赖了哪些模块。

# AST - 抽象语法树
AST就是用来表示源码的一个数据结构，Webpack使用`acorn`将源码解析为AST，例如一行简单的变量定义`var a = 10`将会转换成下面的内容：
```json
{
  "type": "Program",
  "sourceType": "module",
  "start": 0,
  "end": 10,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 0,
      "end": 10,
      "kind": "var",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 4,
          "end": 10,
          "id": { "type": "Identifier", "start": 4, "end": 5, "name": "a" },
          "init": { "type": "Literal", "start": 8, "end": 10, "value": 10, "raw": "10" }
        }
      ]
    }
  ]
}
```

# 一个变量的旅行
可以看到仅仅一行代码，转换后就得到一大坨内容，解析的基本思路就是遍历整个AST，下面我们就先从简单的入手，通过这行代码看看`Parser`是怎么处理这串语法树：

## 解析准备
Webpack调用`Parser`的时机是在文件被`loader`加载后开始，此时文件已经被转换成为一个模块`Module`，接着编译器会调用`build`构建模块：

```js
// NormalModule.js 模块Module的实现类之一
class NormalModule {
    build() {
        const code = this._source.source()
        // 准备构建环境，将编译器实例和配置都带上
        const state = {
            module: this,
            compilation: compilation,
            options: options
        }
        const result = this.parser.parse(code, state)
    }
}
```

## 开始解析
接下来到`Parser`的入口函数，看上去很简单吧，这几个函数的实现也就2400行，外加各种插件穿插调用：

> statement 的中文翻译是`语句/陈述`，是组成程序的基本单元。它主要由`简单语句(simple statement)`及`复合语句(compound statement)`组成，例如`var a = 1`就是简单陈述，`for循环`就是复合陈述。

```js
// Parser.js
class Parser {
    parse(code, initialState) {
        // 将代码解析成AST
        var ast = acornParser.parse(code);
        // 本次解析的上下文，最频繁的作用就是往state.module里添加依赖
        this.state = initialState;
        // 作用域，用于模拟js的函数作用域、块级作用域
		this.scope = {
			topLevelScope: true,
			inTry: false,
			inShorthand: false,
			isStrict: false,
			definitions: new StackedSetMap(),
			renames: new StackedSetMap()
		};
        // 先经过了个钩子，默认有两个插件会在这里注册事件
        if (this.hooks.program.call(ast) === undefined) {
            // 检测是否use strict
            this.detectStrictMode(ast.body);
            // 预处理 statement
            this.prewalkStatements(ast.body);
            // 预处理 block 类型 statement
            this.blockPrewalkStatements(ast.body);
            // 处理 statement
            this.walkStatements(ast.body);
        }
        return this.state
    }
}
```

## detectStrictMode
该函数用于检测当前作用域是否是严格模式，非常简单的函数。首先根据AST树获取到想要的数据，然后输出解析的内容，`Parser`就是通过这种方式来解析代码信息。

如果想要尝试看Parser的源码，可以先通过在线解析工具解析出AST树，再对照解析出来的数据结构看代码，还是非常容易理解的：

![](https://user-gold-cdn.xitu.io/2020/3/3/1709c1202f6fce3f?w=2052&h=1048&f=png&s=171466)

```js
// Parser.js
detectStrictMode(statements) {
    // 第一个语句是否是"use strict"
    const isStrict =
        statements.length >= 1 &&
        statements[0].type === "ExpressionStatement" &&
        statements[0].expression.type === "Literal" &&
        statements[0].expression.value === "use strict";
    if (isStrict) {
        // 当前作用域标记严格模式
        this.scope.isStrict = true;
    }
}

```

## prewalkStatement
> `Prewalking iterates the scope for variable declarations`

预处理普通语句，这个函数主要用于收集代码中定义的变量，并按作用域保存。
```js
// Parser.js
prewalkStatement(statement) {
    switch (statement.type) {
        case "VariableDeclaration":
            this.prewalkVariableDeclaration(statement);
            break;
        case "IfStatement":
            // ...
    }
}
// 变量定义类型语句预解析
prewalkVariableDeclaration(statement) {
    // 只处理var类型的变量定义，const和let在其他地方处理
    if (statement.kind !== "var") return;
    this._prewalkVariableDeclaration(statement);
}
// 遍历变量定义里声明的所有声明
_prewalkVariableDeclaration(statement) {
    for (const declarator of statement.declarations) {
        if (declarator.type === "VariableDeclarator") {
            this.enterPattern(declarator.id, (name, decl) => {
                // 添加到当前作用域里
                this.scope.renames.set(name, null);
                this.scope.definitions.add(name);
            });
        }
    }
}
// 用户获取当前匹配到的标识符
enterPattern(pattern, onIdent) {
    switch (pattern.type) {
        // 如果是变量，获取变量名
        case "Identifier":
            onIdent(pattern.name, pattern);
            break;
        // 如果是对象，获取所有key名
        case "ObjectPattern":
            for (let i = 0; i < pattern.properties.length; i++) {
                this.enterPattern(pattern.properties[i], onIdent);
            }
            break;
        // ...
    }
}
```

## blockPrewalkStatements
>`Block-Prewalking iterates the scope for block variable declarations`

预处理块语句，和上面的函数功能一样，区别只是遍历的是块级变量定义。
```js
// Parser.js
blockPrewalkStatement(statement) {
    switch (statement.type) {
        case "VariableDeclaration":
            this.blockPrewalkVariableDeclaration(statement);
            break;
    }
}
blockPrewalkVariableDeclaration(statement) {
    // 这里只处理let和const声明语句
    if (statement.kind === "var") return;
    this._prewalkVariableDeclaration(statement);
}
```

## walkStatements
```js
// Parser.js
walkStatement(statement) {
    switch (statement.type) {
        case "VariableDeclaration":
            this.walkVariableDeclaration(statement);
            break;
    }
}
walkVariableDeclaration(statement) {
    for (const declarator of statement.declarations) {
        if(declarator.type === "VariableDeclarator") {
            // 获取标识符类型的声明
            const renameIdentifier = declarator.init && this.getRenameIdentifier(declarator.init);
            // 判断是否需要重命名标识符，默认需要重命名的有`define/require/process/process.env/process.env.NODE_ENV`
            if (renameIdentifier && declarator.id.type === "Identifier") {
                const hook = this.hooks.canRename.get(renameIdentifier);
                if (hook !== undefined && hook.call(declarator.init)) {
                    this.scope.renames.set(
                        declarator.id.name,
                        this.scope.renames.get(renameIdentifier) || renameIdentifier
                    );
                    this.scope.definitions.delete(declarator.id.name);
                    return
                }
            }
            // 不需要重命名
            this.walkPattern(declarator.id);
            if (declarator.init) this.walkExpression(declarator.init);
        }
    }
}
// 获取表达试标识符
getRenameIdentifier(expr) {
    const result = this.evaluateExpression(expr);
    if (result && result.isIdentifier()) {
        return result.identifier;
    }
}
// 计算表达式的值
evaluateExpression(expression) {
    // 根据表达式类型，获取处理表达式的钩子
    const hook = this.hooks.evaluate.get(expression.type);
    const result = hook.call(expression);
    if (result !== undefined) {
        result.setExpression(expression);
        return result;
    }
}
// 处理字面量类型的表达式方法，在初始化时会注册到钩子上
this.hooks.evaluate.for("Literal").tap("Parser", expr => {
    switch (typeof expr.value) {
        case "number":
            return new BasicEvaluatedExpression()
                .setNumber(expr.value)
                .setRange(expr.range);
        case "string":
            return new BasicEvaluatedExpression()
                .setString(expr.value)
                .setRange(expr.range);
        case "boolean":
            return new BasicEvaluatedExpression()
                .setBoolean(expr.value)
                .setRange(expr.range);
    }
    if (expr.value instanceof RegExp) {
        return new BasicEvaluatedExpression()
            .setRegExp(expr.value)
            .setRange(expr.range);
    }
});
```

# this.hooks.program
## UseStrictPlugin.js
注册点`WebpackOptionsApply`
```js
// 给js解析器添加插件
normalModuleFactory.hooks.parser.for("javascript/auto").tap("UseStrictPlugin", handler);
```
检测到js第一行是"use strict"，将其添加到依赖。如果在es6模块下不去除，就会有两个"use strict"，因为会给es6模块自动添加一个。
```js
function handler(ast) {
    const firstNode = ast.body[0];
    if (
        firstNode &&
        firstNode.type === "ExpressionStatement" &&
        firstNode.expression.type === "Literal" &&
        firstNode.expression.value === "use strict"
    ) {
        // 将"use strict"替换为空字符串
        const dep = new ConstDependency("", firstNode.range);
        dep.loc = firstNode.loc;
        parser.state.current.addDependency(dep);
        parser.state.module.buildInfo.strict = true;
    }
}
```

## HarmonyDetectionParserPlugin
注册点`WebpackOptionsApply`->`HarmonyModulesPlugin`
```js
function handler(ast) {
    const isStrictHarmony = parser.state.module.type === "javascript/esm";
    const isHarmony = isStrictHarmony ||
        ast.body.some(statement =>
            statement.type === "ImportDeclaration" ||
            statement.type === "ExportDefaultDeclaration" ||
            statement.type === "ExportNamedDeclaration" ||
            statement.type === "ExportAllDeclaration"
        );
    if (isHarmony) {
        const module = parser.state.module;
        // 将模块的导出对象标记为ES6模块导出对象
        const compatDep = new HarmonyCompatibilityDependency(module);
        compatDep.loc = { start: { line: -1, column: 0 }, end: { line: -1, column: 0 }, index: -3 };
        module.addDependency(compatDep);
        // import / export 用 ？？？？
        const initDep = new HarmonyInitDependency(module);
        initDep.loc = { start: { line: -1, column: 0 }, end: { line: -1, column: 0 }, index: -2 };
        module.addDependency(initDep);
        parser.state.harmonyParserScope = parser.state.harmonyParserScope || {};
        parser.scope.isStrict = true;
        module.buildMeta.exportsType = "namespace";
        module.buildInfo.strict = true;
        module.buildInfo.exportsArgument = "__webpack_exports__";
        if (isStrictHarmony) {
            module.buildMeta.strictHarmonyModule = true;
            module.buildInfo.moduleArgument = "__webpack_module__";
        }
    }
}
```

# AST类型检索
## 节点类型
节点类型|示例|描述
|:---:|:--:|:---:|
BlockStatement | `{}` | 表示一个区块 |
VariableDeclaration | `var a = 10` | |
ExpressionStatement | var a = 0; `a++` | 表达式 |
ClassDeclaration | `class foo{}` | |
MethodDefinition | class foo{ `bar(){}` } | 类函数定义 |
FunctionDeclaration | `function foo(){}` | 普通函数定义 |
ReturnStatement | `return true` | |
DoWhileStatement | `do{}while(false)` | |
ForInStatement | `for(var i in foo) {}` | |
ForOfStatement | `for(var i of foo) {}` | |
ForStatement | `for(var i = 0; i < 10; i++) {}` | |
IfStatement | `if(true){}else{}` | |
SwitchStatement | `switch(1) { case 1: break; }` | |
TryStatement | `try {} catch (error) {}` | |
ThrowStatement | `throw new Error()` | |
WhileStatement | `while(true){}` | |
LabeledStatement | `begin: var a = true` | label语法 |
WithStatement | `with (Math) { var a = PI }` | with语法 |
ExportDefaultDeclaration | `export default {}` | 默认导出 |
ExportNamedDeclaration | `export {}` | 普通导出 |
ExportAllDeclaration | `export * from './'` | 导出所有 |

## Pattern类型
节点类型|示例|描述
|:---:|:--:|:---:|
Identifier | var `a` = 1 | 普通赋值 |
ObjectPattern | var `{ a }` = 1 | 解构赋值 |
ArrayPattern | var `[a]` = [10] | 解构赋值 |
Property | var foo = { `a` } | 对象属性 |
RestElement | function foo(`...args`) {} | rest参数 |
AssignmentPattern | var { `a = 10` } = 1 / function foo(`a = true`) {} | 默认值 |

## 表达式类型
表达式类型|示例|描述
|:---:|:--:|:---:|
ArrayExpression | | |
ArrowFunctionExpression | | |
AssignmentExpression | | |
AwaitExpression | | |
BinaryExpression | | |
CallExpression | | |
ClassExpression | | |
ConditionalExpression | | |
FunctionExpression | | |
Identifier | | |
LogicalExpression | | |
MemberExpression | | |
NewExpression | | |
ObjectExpression | | |
SequenceExpression | | |
SpreadElement | | |
TaggedTemplateExpression | | |
TemplateLiteral | | |
ThisExpression | | |
UnaryExpression | | |
UpdateExpression | | |
YieldExpression | | |


# 文件类型
- "javascript/auto": 普通文件
- "javascript/dynamic": Context类型、RawModule等
- "javascript/esm": mjs文件
- "json": json文件
- "webassembly/experimental": wasm文件

## 文件类型注册
`WebpackOptionsDefaulter`

# Parse 
用于解析文件内容，给后续分析依赖提供数据。在`NormalModuleFactory.hooks.resolver`时创建，在创建一个Module时，需要给Module传入一个Parse，如果没有创建过Parse就在这里创建。

- 添加ast处理方法
- 解析出ast
- 遍历ast



# 添加解析器
`JavascriptModulesPlugin`添加了解析js的解析器

## 文件类型对应的Paser
"javascript/auto": "JavascriptModulesPlugin"
"javascript/dynamic": "JavascriptModulesPlugin"
"javascript/esm": "JavascriptModulesPlugin"
"json": "JsonModulesPlugin"
"webassembly/experimental": "WebAssemblyModulesPlugin"

# 参考文章
[AST在线编译查看](https://astexplorer.net/)

[estree](https://github.com/estree/estree)
