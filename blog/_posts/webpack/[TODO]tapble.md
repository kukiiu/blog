# Tapable - 1.1.3
在Webpack源码中,像Compile等很多主要的类都继承自Tapable,先看官方的说明
> The tapable package expose many Hook classes, which can be used to create hooks for plugins.

tapable包含了一组钩子类,用于给插件创建钩子.


Hook一共有三种类型,sync,async,promise,分别对应三种调用方式tap,tapAsync,tapPromise,使用时首先new一个Hook对象,然后使用tab添加函数,
- 执行taps时默认从头到尾
- 在添加一个tab时,会默认添加到taps的最后
- 如果有before或stage则会两两比较
- 如果当前tab.before有值,会插入到该值的前面,before没在taps里会插入到头节点
- 如果没有tab.before,则tab.stage越大,越靠后执行
- tab.context为true时,回掉第一个值传入context,context可以在插件执行流程中逐渐传递数据

intercept可以添加拦截器,
- context属性可以传递全局参数
- register属性可以给每个tab重新赋值options
- call属性在taps执行前执行一次
- tap属性在每个tap执行前执行一次

添加完所有响应函数后,会调用HookCodeFactory.create()产生代码,

## callAsync的异步是调用里面钩子异步，这个函数是同步的

## QA
* Hook._x 在CodeFactory.setup里赋值为taps的所有回掉
* Hook._args存所有参数
* Hook._resetCompilation 为什么需要
* 为什么要用模板
