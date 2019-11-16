---
date: 2018-11-7
tag: 
  - web
  - css
author: kukiiu
location: ShenZhen  
---
# css特殊布局
## 实现已知或者未知宽度的垂直水平居中
```css
// 1
.wraper {
    position: relative;
    .box {
        position: absolute;
        top:50 %;
        left:50 %;
        width:100px;
        height:100px;
        margin: - 50px 0 0 - 50px;
    }
}
// 2
.wraper {
    position: relative;
    .box {
        position: absolute;
        top:50 %;
        left:50 %;
        transform: translate(- 50 %, - 50 %);
    }
}
// 
.wraper {
    .box {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
    }
}
.wraper {
    position: relative;
    .box {
	posiction: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
    }
}
// 
.wraper {
    display: table;
    .box {
        display: table-cell;
        vertical-align: middle;
    }
}
```

## 两栏布局(左侧宽度固定，右侧自适应)
```html
<body>
    <div class="box1">固定宽度</div>
    <div class="box2">可变宽度</div>
</body>
```
### margin + float/absolute
```css
.box1 { width: 200px; float: left }
.box2 { margin-left: 200px }
```

### flex布局
```css
body { display: flex }
.box1 { width: 200px; }
.box2 { flex:1; }
```

### grid布局
```css
body { width:100%; display: grid; grid-template-columns: 200px auto }
```

### 触发BFC
为左侧元素设置浮动后，左侧元素会因为浮动盖在右侧元素上，因此要将右侧元素变成BFC，BFC是一个独立的区域，不会让BFC外的元素对其内部造成干扰。当右侧元素变成一个BFC时它的元素边界会发生变化，会紧紧贴合左侧的元素。 
常见的右侧元素设置—-overflow：hidden；
```css
.box1 { width: 200px; float: left }
.box2 { overflow: hidden }
```

## 三栏布局(左右侧宽度固定，中间自适应)
```html
<body>
    <div class="left">左边</div>  
    <div class="center">中间</div>  
    <div class="right">右边</div>  
</body>
```

### margin + float/absolute
```css
.left{ width: 200px; float: left }
.right{ width: 200px; float: right }
.center{ margin: 0 200px }
```

### flex布局
```css
.left, .right{ width:200px; }
.center{ flex:1; }  
```

### table布局
```css
body { display: table; width: 100% }
.left{ width: 200px; display: table-cell }
.right{ width: 200px; display: table-cell }
```

### grid布局
```css
body { width:100%; display: grid; grid-template-columns: 200px auto 200px; }
```

