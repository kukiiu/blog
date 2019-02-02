# 为什么要用rem适配
* 百分比布局，flex布局，响应式布局 只能做宽度适配（图片除外）
兼容性	Ios	安卓
rem	4.1+	2.1+
vw	6.1+	4.4+

# rem可以做什么
通过媒体查询或js控制html的font-size来控制所有以rem为单位的元素大小
```html
<html lang="en" style="font-size: 100px;">
    <meta name="viewport" content="initial-scale=1,maximum-scale=1, minimum-scale=1, user-scalable=no">
    <body>
        <div style="width: 1rem">该元素的宽度为100px</div>
    </body>
</html>
```

# rem适配原理
## 问题引出：有iphone6手机下1px元素，在不同屏幕尺寸下面应该显示多少才能算比例相同？
iphone6屏幕尺寸: 375px
元素宽度: 1px
其他屏幕尺寸: 360px, 414px...
约束：在不同屏幕尺寸下，元素的尺寸比例相同
解: 
满足约束条件公式为: 1/375 = w1/360 = w2/414
求得: 
在360px屏幕下，应显示: 360/375 = 0.96px
在414px屏幕下，应显示: 414/375 = 1.104px

根据rem特性：
在375px屏幕下，设置font-size=1px，即1rem元素实际尺寸为1px
在360px屏幕下，设置font-size=0.96px，即1rem元素实际尺寸为0.96px
在414px屏幕下，设置font-size=1.104px，即1rem元素实际尺寸为1.104px
此时，该元素在所有屏幕下统一使用1rem为单位，在所有屏幕下比例都相同
设计稿的尺寸换算成rem单位: 1px = 1rem

## 问题引出：有设计稿750px下1px元素，在不同屏幕下面应该显示多少才能算比例相同？
设计稿尺寸(DW): 750px
手机屏幕尺寸(Wi): 360px, 375px, 414px...
约束: 在不同屏幕尺寸下，元素的尺寸比例相同
解: 
设元素尺寸在设计稿下尺寸为: Wpx
则元素在设计稿下尺寸比例为:  W / DW
设元素尺寸在Wi屏幕尺寸为: wipx
则元素在Wi设计稿下尺寸比例为: wi / Wi
满足约束条件公式为: W / DW = w1 / W1 = w2 / W2 = wi / Wi
即：wi = W / DW * Wi
求得: 
在750px设计稿下的1px元素，在360px屏幕下应显示: 1/750 = w/360 => w = 1 / 750 * 360 = 0.48px
在750px设计稿下的1px元素，在375px屏幕下应显示: 1/750 = w/375 => w = 1 / 750 * 375 = 0.5px
在750px设计稿下的1px元素，在414px屏幕下应显示: 1/750 = w/414 => w = 1 / 750 * 414 = 0.552px

根据rem特性：
在Wi屏幕下，设置font-size=wipx，即1rem元素实际尺寸为wipx
此时，该元素在所有屏幕下统一使用1rem为单位，在所有屏幕下比例都相同
设计稿的尺寸换算成rem单位: 1px = 1rem

## 实战适配
```js
// 750px设计稿下，1rem=100px的适配方式
window.onresize = function() {
    // 因为chrome最小font-size为12px,以下代码在chrome不正确
    // document.documentElement.style.fontSize = 1 / 750 * document.documentElement.clientWidth + 'px';
    // 所以将1rem设置为100px，此时在不同屏幕下100px元素的尺寸比例相同，就做到了自适应
    // 相当与将屏幕分成了7.5份，即body的width=7.5rem
    // 设计稿的尺寸换算成rem单位: xpx / 750 = yrem / 7.5 => yrem = xpx / 100
    // 可以看到，设置100px也方便了px到rem的转换
    document.documentElement.style.fontSize = 100 / 750 * document.documentElement.clientWidth + 'px';
}
```   

# 网站适配方案
[Boss直聘](https://www.zhipin.com/c101280600-p100901/?ka=position-100901)
[淘宝](https://h5.m.taobao.com/)


# 媒体查询
```css
html{font-size:10px}
@media screen and (max-width:321px){html{font-size:10px}}
@media screen and (min-width:321px) and (max-width:375px){html{font-size:11px}}
@media screen and (min-width:376px) and (max-width:414px){html{font-size:12px}}
@media screen and (min-width:415px) and (max-width:639px){html{font-size:15px}}
@media screen and (min-width:640px) and (max-width:719px){html{font-size:20px}}
@media screen and (min-width:720px) and (max-width:749px){html{font-size:22.5px}}
@media screen and (min-width:750px) and (max-width:799px){html{font-size:23.5px}}
@media screen and (min-width:800px){html{font-size:25px}}
```   

# 普通适配
如果将屏幕分成10份，每份长度为1rem，则屏幕分为10rem
width=50% = 5rem
```js
window.onresize = function() {
  document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 + 'px';
}
```
# 网易适配
设计稿尺寸已知道 =》 Xpx，注：设计稿尺寸是手机尺寸的2倍
以100px设计稿为单位作为1rem，因为量取方便，即预设基准值
->则设计稿为 D = X/100 rem
屏幕尺寸为Wpx
->则font-size(1rem) =>  W / D px => W * 100 / X
width=50% = 3.75rem
元素尺寸=设计稿元素尺寸/预设基准值：50/100rem = 0.5rem
```js
window.onresize = function() {
  document.documentElement.style.fontSize = document.documentElement.clientWidth / 7.5 + 'px';
}
```


# 淘宝适配
淘宝设计师的工作流程：
第一步，视觉设计阶段，设计师按宽度750px（iPhone 6）做设计稿，除图片外所有设计元素用矢量路径来做。设计定稿后在750px的设计稿上做标注，输出标注图。同时等比放大1.5倍生成宽度1125px的设计稿，在1125px的稿子里切图。
第二步，输出两个交付物给开发工程师：一个是程序用到的@3x切图资源，另一个是宽度750px的设计标注图。
第三步，开发工程师拿到750px标注图和@3x切图资源，完成iPhone 6（375pt）的界面开发。此阶段不能用固定宽度的方式开发界面，得用自动布局（auto layout），方便后续适配到其它尺寸。
第四步，适配调试阶段，基于iPhone 6的界面效果，分别向上向下调试iPhone 6 plus（414pt）和iPhone 5S及以下（320pt）的界面效果。由此完成大中小三屏适配。


# 参考资料
[从网易与淘宝的font-size思考前端设计稿与工作流](http://www.cnblogs.com/lyzg/p/4877277.html)
[使用Flexible实现手淘H5页面的终端适配](https://www.w3cplus.com/mobile/lib-flexible-for-html5-layout.html)
[再聊移动端页面的适配](https://www.w3cplus.com/css/vw-for-layout.html)
[如何在Vue项目中使用vw实现移动端适配](https://www.w3cplus.com/mobile/vw-layout-in-vue.html)
[Rem布局的原理解析](https://yanhaijing.com/css/2017/09/29/principle-of-rem-layout/)