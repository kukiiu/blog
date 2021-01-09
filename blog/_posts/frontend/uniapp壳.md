花了一个月时间使用uni-app从学习到上线了一款移动端H5，页面40+个，打包后看上去像原生APP，上线使用反馈效果还不错，虽然有一些小坑但是总体效果出乎我意料，uni-app功能做的非常牛逼，上手难度小，非常推荐大家使用。

由于需要做成APP，且上线的APP需要频繁更新，最后选择使用H5方式开发，通过基座打包成APP上线，总体效果实践下来很顺畅，安卓下跟原生APP不相上下。以下记录打包上线的思路方法和注意事项：

# 说明书
- 作用: 将H5页面打包成Android和IOS"应用"

- 适用范围: 快速迭代应用功能频繁变更，只有web开发没有APP开发人员

- 限制: 应用只能在线下分发不能上APP商城

# H5页面开发
开发方式同普通移动端h5页面，发布时直接替换旧资源即可。下面记录一些需要注意的事项：

## 多看官方文档
- 基本上遇到的问题都能找到

## css单位
- 统一用`rpx`就行

## 页面切换动画
参考组件市场`page-animation`

## 地图/定位
- h5默认使用腾讯地图，需要注意定位的坐标系，不同坐标系之前需要转换，如gps坐标/国测局坐标/百度坐标等

- 页面唤起APP导航，最好直接使用AppSchema协议，如打开高德定位
```JS
let url = ''
if(isIOS) {
    url = 'iosamap://viewMap?sourceApplication=applicationName&poiname='+this.addr+'&lat='+this.lat+'&lon='+this.lng+'&dev=1'
} else {
    url = 'androidamap://viewMap?sourceApplication=applicationName&poiname='+this.addr+'&lat='+this.lat+'&lon='+this.lng+'&dev=1'
}
window.location.href = url
```

- `map`组件的markers属性无法自动更新，需要更新时给赋值一个新对象
```js
const data = [...]
this.markers = JSON.parse(JSON.stringify(data))
```

# Android壳（APP基座）
主要原理就是在APP中嵌入一个Webview，以实现更新网页不需要从新下载APP，其中有需要注意的点：

- webview要在渲染后设置高度

- 网页有可能会被缓存，需要后台配置缓存策略或者直接在网址后加时间戳，打开的网址也可以由后台返回控制

- 需要监听回退按钮，否则后退时会直接退出APP

- 需要关闭`manifest.json`》APP启动页面配置》启动界面选项中的【等待首页渲染完毕后再关闭Splash图】及【启动界面显示等待雪花】,并在webview渲染后调用`plus.navigator.closeSplashscreen`手动关闭菊花，否则会等10秒才进入页面，具体原因见参考资料

- 基座APP通常不需要更新，要分清楚`wget版本`和`APP版本`的区别

## 嵌入Webview
```html
<template>
    <view>
        <!-- 可根据自己APP情况是否需要加 -->
		<view class="status-bar"></view>
        <!-- Webview容器 -->
        <web-view :webview-styles="webviewStyles" :src="src" />
    </view>
</template>

<script>
	var webview
	export default {
        data() {
            return {
                // 可根据需要加时间戳
				src: "https://xxx.com.cn?_t=" + (new Date().getTime()),
                webviewStyles: {},
            }
        },
		onReady:function() {
            // 获取当前web-view
			var currentWebview = this.$scope.$getAppWebview();
			uni.getSystemInfo({
				success: (sysinfo) => {
                    // 页面初始化延时调用，防止webview还未渲染
					var interval = setInterval(() => {
						webview = currentWebview.children()[0];
						if(!webview) return
                        // 给Webview设置全屏展示
						webview.setStyle({ top: sysinfo.statusBarHeight, bottom: 0 })
                        // 关闭启动加载菊花
						setTimeout(function() { plus.navigator.closeSplashscreen() }, 600);
                        // 初始化成功清除
						clearInterval(interval)
					}, 100);
				},
				complete: () => {}
			});
		},
		onBackPress: function(options){
            // 监听手机回退按钮/手势，使得后退是回退页面不是退出APP
			webview.canBack(function(e){
				if(!e.canBack) {
					return plus.runtime.quit();
				}
				webview.back();
			})
			return true
		}
    }
</script>

<style>
	.status-bar {
      height: var(--status-bar-height);
      width: 100%;
	}
</style>
```

## 更新APP
这里是指基座APP需要更新的情况，APP更新分为`全量更新`和`热更新`，

- 获取版本信息，可根据版本信息到后台请求更新资源
```js
//  获取wgt资源版本，即`manifest.json`配置的版本
plus.runtime.getProperty(plus.runtime.appid, async function(widgetInfo) {
    widgetInfo.version,
    widgetInfo.versionCode,
})

//  获取App版本，未打增量包时同wgt资源版本
plus.runtime.version,
plus.runtime.versionCode,
```

- 全量更新，直接打开手机浏览器下载，最方便，但是体验不好。
```js
let url = '后台返回的.apk'
// 打开手机浏览器
plus.runtime.openURL(url)
```

- 全量更新，在APP内下载，可监听下载进度并绘制好看的UI。

> 如果是异步获取更新信息，这时候APP绘制UI无法置于顶层，会被webview组件覆盖，可以使用`subNVues`绘制原生UI，通过事件通信传递下载信息
```js
let url = '后台返回的.apk'
// 下载资源
var dtask = plus.downloader.createDownload(url, {}, function(d, status) {
    if (status == 200) { // 下载成功
        var path = d.filename; // 文件下载到手机的位置
        plus.runtime.install(path); // 安装文件
    } else {
        uni.showToast({ icon: 'none', title: '下载失败', duration: 1000 });
        plus.downloader.clear(); //清除下载任务
    }
})

// 添加下载进度监听
dtask.addEventListener("statechanged", ( download, status ) {
    // 进度...
}, false);

// 开启下载任务
dtask.start();
```
- 热更新  

热更新不需要用户从新下载新包，只需要下载增量包后安装即可，优点是增量包体积小，升级对用户无感，部分情况不能用增量更新，具体可参考官方文档。
> PS: 增量更新可以跨版本更新，也可以多次迭代更新，也就是说增量包是以第一次打的全量包为基础！至于增量包如何指定从那个全量版本开始打暂时还不清楚，官网好像说是跟版本号有关，对这个有了解的可以交流一下！
```js
let url = '后台返回的.wget'
// 直接下载
uni.downloadFile({ url, success: (downloadResult) => {  
    if (downloadResult.statusCode === 200) { 
        // 安装下载资源
        plus.runtime.install(downloadResult.tempFilePath, {force: false}, function() {
            // 更新完后重启生效
            plus.runtime.restart();  
        }, function(e) {  
            uni.showToast({ icon: 'none', title: '资源更新失败', duration: 1000 });
        });  
    }}  
});  
```

## 打包
直接使用原生APP云打包即可


# IOS壳
IOS除非打越狱包否则做不了APP壳，但是IOS下有个`webclip`，类似于快捷方式，通过这个可以将一个网址制作成IOS桌面图标，当然也是不能上架到苹果商店，用户可以直接扫码安装，看上去跟APP很像。

在Mac上下载【Apple Configurator 2】软件，一步步填写配置即可，具体教程网上可以搜索。


# 参考资料
[全量更新](https://ask.dcloud.net.cn/article/34972)

[热更新](https://ask.dcloud.net.cn/article/35667)

[APP内下载](https://www.dcloud.io/docs/api/zh_cn/downloader.html#plus.downloader.Download)

[subNVue原生子窗体](https://www.bookstack.cn/read/uniapp-api/3915c299c1c48f89.md)

[uni-app 启动界面参数配置说明 | 启动慢的原因](https://ask.dcloud.net.cn/article/35565)

[IOS WEBCLIP 生成，使用，签名，发布总结](https://my.oschina.net/wuweixiang/blog/3144212)
