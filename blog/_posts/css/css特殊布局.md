# 实现已知或者未知宽度的水平居中

```html
<div class="parent">
    <div class="child"></div>
</div>
```

* absolute + margin 
```css
.parent {
    position: relative;
    .child {
        position: absolute;
        top:50 %;
        left:50 %;
        width:100px;
        height:100px;
        margin: - 50px 0 0 - 50px;
    }
}
```

* absolute + transform 
```css
.parent {
    position: relative;
    .child {
        position: absolute;
        top:50 %;
        left:50 %;
        transform: translate(- 50 %, - 50 %);
    }
}
```

* inline-block + text-align 
```css
.parent { 
    text-align: center; 
    .child { 
        display: inline-block;
    }
}
```

* table + margin 
```css
.child {
    display: table;
    margin: 0 auto;
}
```

* flex + magin 
```css
.parent {
    display: flex;
    .child {
        margin: 0 auto;
    }
}
```

* flex + justify-content 
```css
.parent {
    display: flex;
    .child {
        justify-content: center;
        align-items: center;
        height: 100px;
    }
}
```

* absolute
```css
.parent {
    position: relative;
    .child {
        posiction: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
    }
}
```

* table-cell + vertical-align
```css
.parent { 
    display: table-cell;
    vertical-align: middle; 
}
```


# 两栏布局(左侧宽度固定，右侧自适应)
```html
<body>
    <div class="left">固定宽度</div>
    <div class="right">可变宽度</div>
</body>
```
* margin + float/absolute
```css
.left { width: 200px; float: left }
.right { margin-left: 200px }
```

* flex布局
```css
body { display: flex }
.left { width: 200px; }
.right { flex:1; }
```

* grid布局
```css
body { width:100%; display: grid; grid-template-columns: 200px auto }
```

* float + overflow 触发BFC
> 为左侧元素设置浮动后，左侧元素会因为浮动盖在右侧元素上，因此要将右侧元素变成BFC，BFC是一个独立的区域，不会让BFC外的元素对其内部造成干扰。当右侧元素变成一个BFC时它的元素边界会发生变化，会紧紧贴合左侧的元素。 
常见的右侧元素设置—-overflow：hidden；
```css
.left { width: 200px; float: left }
.right { overflow: hidden }
```

* table
```css
body { display: table; width: 100%; table-layout: fixed; }
.left { display: table-cell; width: 100px; }
.right { display: table-cell; }
```

* flex布局
```css
body { display: flex }
.right { flex:1; }
```

# 两栏布局(左侧宽度不固定，右侧自适应)
```html
<body>
    <div class="left">固定宽度</div>
    <div class="right">可变宽度</div>
</body>
```
* float + overflow
```css
.left { float: left }
.right { overflow: hidden }
```

* table
```css
body { display: table; width: 100%; }
.left { display: table-cell; width: 0.1%; }
.right { display: table-cell; }
```

## 三栏布局(左右侧宽度固定，中间自适应)
```html
<body>
    <div class="left">左边</div>  
    <div class="center">中间</div>  
    <div class="right">右边</div>  
</body>
```

* margin + float/absolute
```css
.left{ width: 200px; float: left }
.right{ width: 200px; float: right }
.center{ margin: 0 200px }
```

* flex布局
```css
.left, .right{ width:200px; }
.center{ flex:1; }  
```

* table布局
```css
body { display: table; width: 100% }
.left{ width: 200px; display: table-cell }
.right{ width: 200px; display: table-cell }
```

* grid布局
```css
body { width:100%; display: grid; grid-template-columns: 200px auto 200px; }
```

# 等宽布局
```html
<div class="parent">
    <div class="columm">列</div>  
    <div class="columm">列</div>  
    <div class="columm">列</div>  
    <div class="columm">列</div>  
</div>
```

* float
```css
.parent { margin-left: -20px; }
.column { padding-left: 20px; float: left; width: 25%; box-sizing: border-box; }
```

* flex
```css
.parent { display: flex; }
.column { flex: 1; }
```

# 等高布局
```html
<div class="parent">
    <div class="left"></div>  
    <div class="right"></div>  
</div>
```

* table
```css
.parent { display: table; width: 100%; table-layout: fixed; }
.left { display: table-cell; width: 100px; border-right: 20px solid transparent; background-clip: padding-box; }
.right { display: table-cell; }
```

* flex
```css
.parent { display: flex; }
.left {  width: 100px; }
.right { flex: 1; }
```

* float + overflow
```css
.parent { overflow: hidden; }
.left { float: left; width: 100px; margin-right: 20px; }
.right { overflow: hidden; }
.left,.right { padding-bottom: 9999px; margin-bottom: -9999px; }
```
