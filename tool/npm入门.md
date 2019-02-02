# npm是什么
- [npm](https://www.npmjs.com/)是一个仓库网站，收集了各种有用的js库，也可以发布自己的js库到网站上分享给别人
- npm是命令行工具 (CLI)，一个js包管理工具，内置的命令可以方便的管理项目依赖

# npm安装使用

## 安装npm
从 [Node.js网站](https://nodejs.org/en/download/)安装Node.js，Node.js安装成功后npm会自动安装
```shell
# 安装成功后查看npm版本
$ npm -v
```

## 更新npm版本
因为npm比Node.js更新更频繁，下载后可以检查npm更新
```shell
# 更新npm到最新版本
$ npm install npm@latest -g
```

## 安装js库
```shell
# 安装jquery到当前目录
npm install jquery
```
安装完成后会在当前目录下生成node_modules文件夹和package-lock.json文件
![a2bd2c9e04b6bac846be79fc8506406.png](/qn/content/FoghXpvaYQEqM1oKNTSOsybv7q00)
另外控制台会有警告说当前目录找不到package.json文件等
打开package-lock.json后，可看见jquery的版本为3.3.1，resolved值为https://registry.npmjs.org/jquery/-/jquery-3.3.1.tgz指从该地址下载的jquery包
![7dcae907d6fa7123a45d7cfbbf3cb98.png](/qn/content/FlkggJew3S9b3FgtCIOpYfYsn9Ee)

## 使用js库
在当前目录下新建index.html，引入./node_modules/jquery/dist/jquery.min.js就可以使用jquery了


# 本地安装 vs 全局安装
大部分时候都应该把依赖安装到本地（默认），因为这样会减少因版本不一致导致的错误
如果你想将其作为一个命令行工具，那么你应该将其安装到全局，安装到全局后能直接使用该命令，如cmpn安装
```shell
# 安装到全局
npm install -g <package>
```

# 镜像
默认情况下，npm install会从https://registry.npmjs.org/下载库文件，这个网站在国外所以访问速度较慢，所以可以从国内的服务器下载，[淘宝镜像](http://npm.taobao.org/)是其中一个，网站会定时同步国外的资源
## 方法一：使用cnpm替代npm
```shell
# 1. 安装cnpm
$ npm install -g cnpm --registry=https://registry.npm.taobao.org

# 2.使用命令cnpm替代
$ cnpm install jquery
```

## 方法二：使用npm配置registry
```shell
# npm运行时带参数registry
$ npm install jquery --registry=https://registry.npm.taobao.org
```

## 方法三：Linux使用alias
```shell
# 1.声明alias
$ alias cnpm="npm --registry=https://registry.npm.taobao.org \
--cache=$HOME/.npm/.cache/cnpm \
--disturl=https://npm.taobao.org/dist \
--userconfig=$HOME/.cnpmrc"

# 2.使用别名cnpm
$ cnpm install jquery
```

运行后可以看到速度明显提升
![0325bb577b3e88f9d9f9fe496049a8c.png](/qn/content/FmoYDBn6YPRAJ7rRxTFVfYF6N07F)
另外package-lock.json文件中，resolved的值已经变为http://registry.npm.taobao.org/jquery/download/jquery-3.3.1.tgz，说明是从淘宝服务器下载到的库


# 参考资料
* [npm官网](https://www.npmjs.com/)
* [npm淘宝镜像](http://npm.taobao.org/)