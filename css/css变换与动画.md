# transform 变换
> transform 属性向元素应用 2D 或 3D 转换。该属性允许我们对元素进行旋转、缩放、移动或倾斜。

> transform-origin: x-axis y-axis z-axis; 指定元素变化基点

```html
// 让所有div都旋转30度
div {
    transform: rotate(30deg);
    -webkit-transform: rotate(30deg);
    transform-origin: center;
    -webkit-transform-origin: center;
}
```

|值|描述|
|-|-|
| none|	定义不进行转换。	|
| matrix(n,n,n,n,n,n)|	定义 2D 转换，使用六个值的矩阵。	|
| matrix3d(n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n)|	定义 3D 转换，使用 16 个值的 4x4 矩阵|
| translate(x,y)|	定义 2D 转换。	|
| translate3d(x,y,z)|	定义 3D 转换|
| translateX(x)|	定义转换，只是用 X 轴的值。	|
| translateY(y)|	定义转换，只是用 Y 轴的值。	|
| translateZ(z)|	定义 3D 转换，只是用 Z 轴的值|
| scale(x,y)|	定义 2D 缩放转换。	|
| scale3d(x,y,z)|	定义 3D 缩放转换|
| scaleX(x)|	通过设置 X 轴的值来定义缩放转换。	|
| scaleY(y)|	通过设置 Y 轴的值来定义缩放转换。	|
| scaleZ(z)|	通过设置 Z 轴的值来定义 3D 缩放转换|
| rotate(angle)|	定义 2D 旋转，在参数中规定角度。	|
| rotate3d(x,y,z,angle)|	定义 3D 旋转|
| rotateX(angle)|	定义沿着 X 轴的 3D 旋转。	|
| rotateY(angle)|	定义沿着 Y 轴的 3D 旋转。	|
| rotateZ(angle)|	定义沿着 Z 轴的 3D 旋转。	|
| skew(x-angle,y-angle)|	定义沿着 X 和 Y 轴的 2D 倾斜转换。	|
| skewX(angle)|	定义沿着 X 轴的 2D 倾斜转换。	|
| skewY(angle)|	定义沿着 Y 轴的 2D 倾斜转换。	|
| perspective(n)|	为 3D 转换元素定义透视视图。	|


# transition 过渡动画
> transition指定css属性变化时的过渡效果

```html
// 当鼠标放上div上width改变，transition指定width改变用时2s
div {
    width:100px;
    transition: width 2s;
    -webkit-transition: width 2s;
}
div:hover {
    width:300px;
}
```
``` html
transition: property duration timing-function delay;
transition-property	规定设置过渡效果的 CSS 属性的名称。
transition-duration	规定完成过渡效果需要多少秒或毫秒。
transition-timing-function	规定速度效果的速度曲线。
transition-delay	定义过渡效果何时开始。
```


# animation 动画

```html
@keyframes	规定动画
animation	所有动画属性的简写属性，除了 animation-play-state 属性
animation-name	规定 @keyframes 动画的名称
animation-duration	规定动画完成一个周期所花费的秒或毫秒
animation-timing-function	规定动画的速度曲线
animation-delay	规定动画何时开始
animation-iteration-count	规定动画被播放的次数
animation-direction	规定动画是否在下一周期逆向地播放
animation-play-state	规定动画是否正在运行或暂停
animation-fill-mode	规定对象动画时间之外的状态
```

### @keyframes 动画定义 需结合animation试用
> @keyframes animationname { keyframes-selector {css-styles;} }
```html
div {
    width: 100px;
    height: 100px;
    background: red;
    animation: mymove 5s infinite;
    -webkit-animation: mymove 5s infinite;
}
@keyframes mymove {
    from   {top:0px; background:red;}
    50%  {top:100px; background:blue;}
    to {top:0px; background:red;}
}
@-webkit-keyframes mymove {
    from   {top:0px; background:red;}
    50%  {top:100px; background:blue;}
    to {top:0px; background:red;}
}
```

### animation 指定使用动画
> animation: name duration timing-function delay iteration-count direction;

### animation-play-state 指定动画是否运行
- running运行（默认）  
- paused暂停 

### animation-play-state 指定动画执行时间之外的状态
- none	不改变默认行为
- forwards	当动画完成后，保持最后一个属性值（在最后一个关键帧中定义）
- backwards	在 animation-delay 所指定的一段时间内，在动画显示之前，应用开始属性值（在第一个关键帧中定义）
- both	向前和向后填充模式都被应用

# 参考资料
[w3school: transform](http://www.w3school.com.cn/cssref/pr_transform.asp)
[w3school: transition](http://www.w3school.com.cn/cssref/pr_transition.asp)
[w3school: animation](http://www.w3school.com.cn/css3/css3_animation.asp)
