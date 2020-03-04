# 初识Js解析器
Js解析器`Parser`是Webpack中最重要的工具之一，不同类型的文件在经过`loader`处理后，将会被转换输出成为一串js字符串。紧接着`Parser`会将其转换为`AST`语法树，有了语法树就可以对代码为所欲为了，其中最重要的功能就是分析出这段代码依赖了哪些模块。Webpack将会基于解析出来的信息进行依赖组合及内容输出，所以`Parser`在其中扮演非常重要的角色，值得我们认真研究。

由于解析器整体代码还是比较复杂，除了解析依赖还做了很多其他功能处理，而且依赖解析还兼容CommonJS、ES6Module、AMD等，刚开始看源码容易蒙圈。为了简单起见，这里不会把这些内容都分析一遍，其实大部分操作其实都大同小异，所以只要理解它的思路就能做到一通百通。

下面我们先通过简单的一行代码，分析`Parser`是如何解析出CommonJS依赖：
```js
// 普通的引入模块操作
require('./increment')
```

# 开始解析
首先来到`Parser`的入口函数，可以看到入口还是非常简洁，解析AST的操作交给`acorn`库去处理，`Parser`的主要内容集中在对AST的解析上，同时这里初始化的`state`用于保存本次解析的结果：
```js
/** Parser.js */
class Parser {
    parse(code, initialState) {
        // 将代码解析成AST
        var ast = acornParser.parse(code);
        // 本次解析的上下文，最频繁的作用就是往state.module里添加依赖
        this.state = initialState;
        // 处理解析内容
        this.walkStatements(ast.body);
        return this.state
    }
}
```

# AST - 抽象语法树
AST就是用来表示源码的一个数据结构，我们可以利用在线解析器来可视化AST，例如上面这行语句将会转换成以下内容：

![](https://user-gold-cdn.xitu.io/2020/3/3/170a0ca6cb01bce7?w=2196&h=1228&f=png&s=221220)

# 解析AST
可以看到仅仅一行代码，转换后就得到一大坨内容，解析AST的基本思路就是遍历整个AST并提取想要的数据。

由于AST语法树是层层嵌套的结构，且结构类型非常多，所以遍历AST相关的代码就占了一大半，好在这部分代码还是比较简单，只要对照着AST树来看还是很容易理解。

提取数据是这里的复杂点，`Parser`本身只支持作用域和部分表达式相关的核心内容处理，其他包括解析依赖等都是各种插件提供的能力，这样做使得`Parser`灵活性和扩展性非常好，当然代码调试起来就复杂多了，所以这里我们将处理`CommonJS`等相关的插件写成同步调用方便分析。

接下来我们来看看具体执行代码：
 
```js
/** Parser.js */
// 遍历所有语句
walkStatements(statements) {
    for (let index = 0, len = statements.length; index < len; index++) {
        const statement = statements[index];
        this.walkStatement(statement);
    }
}
// 处理单个语句，交给对应类型语句处理函数，这里是表达式语句
walkStatement(statement) {
    switch (statement.type) {
        case "ExpressionStatement":
            this.walkExpressionStatement(statement);
            break;
        // ...
    }
}
// 处理具体的表达式内容
walkExpressionStatement(statement) {
    this.walkExpression(statement.expression);
}
// 交给不同类型表达式处理函数，这里是函数调用表达式
walkExpression(expression) {
    switch (expression.type) {
        case "CallExpression":
            this.walkCallExpression(expression)
            break;
        // ...
    }
}
// 处理函数调用表达式
walkCallExpression(expression) {
    // "callee": { "type": "Identifier", "name": "require" },
    // "arguments": [ { "type": "Literal", "value": "./increment", "raw": "'./increment'" } ]
    const callee = this.evaluateExpression(expression.callee);
    // 这里判断函数调用类型是`require(xxx)`，即`require`是标识符的情况，其他情况如`a.require(xx)`是成员函数的情况则过滤掉
    if (callee.isIdentifier()) {
        /** CommonJsRequireDependencyParserPlugin.js */
        const param = parser.evaluateExpression(expression.arguments[0]);
        // 参数是字符串的解析方法
        if (param.isString()) {
            // 添加模块依赖，用于递归加载解析模块
            const dep = new CommonJsRequireDependency(param.string, param.range);
            dep.loc = expr.loc;
            dep.optional = !!parser.scope.inTry;
            parser.state.current.addDependency(dep);
            // 另外一个依赖，用于将代码中的`require`转换成`__webpack_require__`
            const dep = new RequireHeaderDependency(expression.callee.range);
            dep.loc = expression.loc;
            parser.state.current.addDependency(dep);
            return
        }
    } else 
    // 参数是表达式处理方式：`require(1 > 0 ? './example' : './increment')`
    if(param.isConditional()) {
        // ... 
    }
    // ...
}
// 计算表达式的值
evaluateExpression(expression) {
    let result
    switch(expression.type) {
        case "Identifier":
            result = evaluateIdentifierExpression(expression)
            break;
        case "Literal": 
            result = evaluateLiteralExpression(expression)
            break;
    }
    if (result !== undefined) {
        result.setExpression(expression);
        return result;
    }
}
// 处理标识符类型的表达式方法，this.hooks.evaluate.for("Identifier")
evaluateIdentifierExpression(expression) {
    if(expression.name === 'require') {
        /** CommonJsPlugin.js */
        let evex = new BasicEvaluatedExpression()
            .setIdentifier('require')
            .setRange(expr.range);
        return evex;
    }
}
// 处理字面量类型的表达式方法，this.hooks.evaluate.for("Literal")
evaluateLiteralExpression(expression) {
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
}
```

# 结尾
经过上面一顿操作后，输出了两个依赖`CommonJsRequireDependency`和`RequireHeaderDependency`，至此Webpack成功将文件内容转换为内部对象，这些对象将在后续分依赖及输出时发挥作用。

当然这里只分析了简易版`Parser`的执行流程，中间可能有些大家不熟悉的名词，这里只要能看懂他们实现的结果就行，后续将会详细分析里面的内容。

# 参考文章
[AST在线编译查看](https://astexplorer.net/)
