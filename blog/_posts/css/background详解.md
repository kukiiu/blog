---
date: 2018-11-7
tag: 
  - web
  - css
author: kukiiu
location: ShenZhen  
---
# background详解

## 背景图绘制顺序
- 先绘制background-color
- 先设置的图像绘制在最顶部
- 绘制border在图像顶部

## 背景css属性
```html
background : bg-color bg-image position / bg-size bg-repeat bg-origin bg-clip bg-attachment initial|inherit;
```

- background-image ：设置元素的背景图片。
- background-color : 设置背景颜色。
- background-repeat ：设置如何平铺背景图片。
- background-attachment ：设置背景图片是否固定或随着滚动移动。
- background-position ：设置背景图片的位置。
- background-size ：设置背景图片的大小。
- background-clip
- background-origin

## backgorund-size
- 设置具体的值 。background-size：100px 200px。你设置的多大  背景图片就有多大，当只设置一个值的时候高度会auto。
- 设置百分数 。background-size：100% 100% ，图片的宽高 会以容器的宽度为基准，来生成大小。当只设置一个值的时候，高度的值会默认为auto。
- background-size： cover，不会考虑图片本身的比例，让图片能够把容器充满，所以很有可能图像只显示一部分。
- background-size： contain 把图像图像扩展至最大尺寸一直到。他们的宽度和高度都能接触到容器。

## background-clip
- border-box,默认值,背景的颜色会包括 border + padding + content
- padding-box的时候,背景颜色包括padding + content
- content-box，背景颜色包括content

## background-origin
- padding-box：默认值。意思就是以padding开始为标准定位。
- border-box: 以padding开始为标准定位。
- content-box: 以内容区域为标准定位。

# 参考资料
https://www.cnblogs.com/moqing/p/5831244.html