---
date: 2018-11-7
tag: 
  - markdown
author: kukiiu
location: ShenZhen  
---
# Markdown使用指南

# 标题
```markdown
# 这是一级标题
## 这是二级标题
### 这是三级标题
#### 这是四级标题
##### 这是五级标题
###### 这是六级标题
```
# 这是一级标题
## 这是二级标题
### 这是三级标题
#### 这是四级标题
##### 这是五级标题
###### 这是六级标题

# 字体
```markdown
**这是加粗的文字**
*这是倾斜的文字*`
***这是斜体加粗的文字***
~~这是加删除线的文字~~
<center>这一行需要居中</center>
```
**这是加粗的文字**
*这是倾斜的文字*`
***这是斜体加粗的文字***
~~这是加删除线的文字~~
<center>这一行需要居中</center>

# 引用

>这是引用的内容
>>这是引用的内容
>>>>>这是引用的内容

# 分割线
```markdown
---
***
```
---
***

# 超链接
```markdown
[超链接名](超链接地址 "超链接title")
title可加可不加
```
[百度](http://baidu.com)


# 图片
```markdown
![图片alt](图片地址 ''图片title'')
![点滴轻舍.png](http://phg1rho3u.bkt.clouddn.com/logo.png)
图片alt就是显示在图片下面的文字，相当于对图片内容的解释。
图片title是图片的标题，当鼠标移到图片上时显示的内容。title可加可不加
图片居中：
<div align=center>
![点滴轻舍.png](http://phg1rho3u.bkt.clouddn.com/logo.png)
</div>
```
![点滴轻舍.png](http://phg1rho3u.bkt.clouddn.com/logo.png)

# 列表
```markdown
- 无序列表
+ 无序列表
* 无序列表
1. 有序列表
2. 有序列表
3. 有序列表
* 嵌套列表
  * 嵌套列表子项
    * 嵌套列表子子项
嵌套列表上级和下级之间敲两个空格即可
```
- 无序列表
+ 无序列表
* 无序列表
1. 有序列表
2. 有序列表
3. 有序列表
* 嵌套列表
  * 嵌套列表子项
    * 嵌套列表子子项

# 表格
```markdown
表头一|表头二|表头三
|---|:--:|---:|
内容|内容|内容
内容|内容|内容
文字默认居左
- 两边加：表示文字居中
- 右边加：表示文字居右
```
表头一|表头二|表头三
|---|:--:|---:|
内容|内容|内容
内容|内容|内容

# 代码
```markdown
单行代码：
`echo 'hello world'`
多行代码：括号为反转义用，实际去掉
(```)javascript
console.log('test');
(```)
```
`echo 'hello world'`
```javascript
console.log('test');
```

# 直接嵌入html
```markdown
<h3>嵌入的h3</h3>
嵌入的换行<br/><br/>
<center>嵌入的居中</center>
<b>粗体文本</b><br/>
<tt>类似打字机或者等宽的文本效果</tt><br/>
<i>斜体文本效果</i><br/>
<big>大号字体效果</big><br/>
<small>小号字体效果</small><br/>
<del>被删除的文本</del><br/>
定义<sub>下标文本</sub><br/>
定义<sup>上标文本</sup><br/>
```
<h3>嵌入的h3</h3>
嵌入的换行<br/><br/>
<center>嵌入的居中</center>
<b>粗体文本</b><br/>
<tt>类似打字机或者等宽的文本效果</tt><br/>
<i>斜体文本效果</i><br/>
<big>大号字体效果</big><br/>
<small>小号字体效果</small><br/>
<del>被删除的文本</del><br/>
定义<sub>下标文本</sub><br/>
定义<sup>上标文本</sup><br/>

# 流程图：暂不支持
