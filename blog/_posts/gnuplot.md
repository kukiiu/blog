# gnuplot命令行画图软件

## 下载/配置
### 下载
`>> apt-get install gnuplot`
### 进入软件
`>> gnuplot`
### 修改输出配置
`gnuplot> set terminal xxxx`
常用输出格式:
- dumb: 纯命令行展示图片，使用ascii字符展示。
- x11: 在图形化窗口中打开，需要安装`gnuplot-x11`。
### 试一下是否正确安装
`gnuplot> plot sin(x)`

## 常用命令
- 将文件qps的第一列数据绘制成图片
`gnuplot> plot "qps" using 1 w lines title "QPS"`

## 其他
