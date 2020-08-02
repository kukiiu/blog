---
date: 2018-11-7
tag: 
  - web
  - css
author: kukiiu
location: ShenZhen  
---
# 移动端适配方案

## 标准适配方案：百分比自适应(流式布局) + viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```
* 页面宽度和浏览器宽度相等  width=device-width
* 默认显示的缩放比例和PC端保持一致（缩放比例1.0） initial-scale=1.0
* 不允许用户缩放网页  user-scalable=no
* 内容宽度100%

## 响应式布局（媒体查询）适配方案

## flex布局适配方案

## rem布局适配方案
为什么要用？
* 百分比布局，flex布局，响应式布局 只能做宽度适配（图片除外）
媒体查询或js控制html的font-size来控制所有以rem为单位的大小

## viewport是什么

## 二倍图清晰的原理

# 参考资料