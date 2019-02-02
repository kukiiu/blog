## 查看依赖信息
```shell
$ npm view react
```

## 安装依赖
```shell
# 安装本地依赖
$ npm install <package>
# 安装全局依赖
$ npm install -g <package>
```

## 卸载依赖
```shell
# 仅删除/node_module/下依赖
$ npm uninstall <package>
# package.json中dependency也删除
$ npm uninstall --save <package>
# package.json中devDependency也删除
$ npm uninstall --save-dev <package>
# 卸载全局依赖
$ npm uninstall -g <package>
```

## 更新依赖
```shell
# 更新本地依赖
$ npm update
# 更新全局依赖
$ npm update -g <package>
```

## 缓存
```shell
# 查看缓存目录
$ npm config get cache
# 清除缓存
$ npm cache clean
```

## 检查版本更新
```shell
$ npm outdated
$ npm outdated -g
```

