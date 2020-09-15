# http-load

## 下载安装
- 获取源文件
`wget http://www.acme.com/software/http_load/http_load-09Mar2016.tar.gz`
- 解压
`mkdir ./http_load && tar -xzvf http_load-09Mar2016.tar.gz -C http_load --strip-components 1`
- 安装编译工具
`apt install make gcc`
- 打包
`make`
- 将工具放到bin下
`make install`

## 基本使用
### 参数解析
- fetches：总访问次数
- rate：每秒访问次数
- seconds：总访问时间
- parallel：并发的用户进程数

### 执行
- 创建待测试文件
`echo 'http://www.baidu.com' > hltest`
- 执行测试
```
>> http_load -parallel 1 -seconds 1 hltest

http://www.baidu.com: byte count wrong
...
16 fetches, 1 max parallel, 4.53203e+06 bytes, in 1 seconds
283252 mean bytes/connection
16 fetches/sec, 4.53203e+06 bytes/sec
msecs/connect: 12.6544 mean, 18.978 max, 7.086 min
msecs/first-response: 10.2472 mean, 12.756 max, 8.189 min
15 bad byte counts
HTTP response codes:
  code 200 -- 16
```

## 应用-测试网站QPS
### 测试方式
- -p -f: 使用p个用户以最快速度请求f次
- -p -s: 使用p个用户在s秒内以最快速度请求

### 测试脚本
- 创建测试地址文件
`echo 'http://www.baidu.com' > hltest`

- 创建测试脚本
`vim qps_test.sh`
```bash
#!/bin/bash

file=$1
output=$2
max_parallel=$3
second=$4
[ ! $file ] && echo 'need test file' && exit
[ ! $output ] && echo 'need output file' && exit
[ ! $max_parallel ] && echo 'need max_parallel' && exit
[ ! $second ] && echo 'need second' && exit

echo "parallel fetches/sec mean max min" > $output

for i in $(seq 1 $max_parallel)
do
	echo "fetching...$i/$max_parallel"
	http_load -parallel $i -seconds $second $file | awk -v p="$i" '/fetches\/sec/{printf "%d %f ",p, $0} /msecs\/first-response/{print $2, $4, $6}' >> $output
done

cat $output
```

- 添加文件执行权限
`chmod -x ./qps_test.sh`

- 执行测试
分别测试1~16个并发，每个并发执行1秒: `./qps_test hltest output 16 1`
```
parallel fetches/sec mean max min
1 12.997600 47.496 286.091 12.59
2 13.984100 56.7671 358.767 17.196
3 16.994800 107.063 332.213 16.383
4 46.981100 48.6948 293.366 13.043
5 73.973700 35.815 441.134 13.633
6 21.981300 113.503 397.646 23.621
7 6.999980 212.626 429.576 82.63
8 3.999330 365.104 377.362 360.441
9 109.959000 39.7875 318.747 12.208
10 111.900000 50.1297 526.132 14.857
11 172.942000 30.3109 334.708 12.558
12 102.916000 39.8194 156.643 17.229
13 172.977000 39.4943 130.972 15.603
14 153.987000 42.7833 175.279 14.18
15 193.000000 37.4072 79.056 16.949
16 227.000000 36.8423 281.948 15.063
```

- 使用gnuplot绘制图表
`gnuplot> plot "output" using 2 w lines title "QPS"`

## 应用-测试网站承受压力
### 测试方式
- -r -s: 每秒r次请求s秒

### 创建测试脚本
`vim rate_test.sh`
```bash
#!/bin/bash

file=$1
output=$2
start_rate=$3
max_rate=$4
second=$5
[ ! $file ] && echo 'need test file' && exit
[ ! $output ] && echo 'need output file' && exit
[ ! $start_rate ] && echo 'need start_rate' && exit
[ ! $max_rate ] && echo 'need max_rate' && exit
[ ! $second ] && echo 'need second' && exit

echo "rate fetches/sec mean max min" > $output

for i in $(seq $start_rate $max_rate)
do
	echo "fetching...$i/$max_rate"
	http_load -rate $i -seconds $second $file | awk -v p="$i" '/fetches\/sec/{printf "%d %f ",p, $0} /msecs\/first-response/{print $2, $4, $6}' >> $output
done

cat $output
```

### 测试结果
`./rate_test.sh hltest output 1 5 10`
```
rate fetches/sec mean max min
1 0.898172 32.8043 61.051 17.904
2 1.895750 37.0463 232.302 18.263
3 2.896690 41.4187 217.997 18.96
4 3.791910 42.3719 274.23 17.579
5 4.790370 27.5035 48.763 17.739
```

## 源码解析
通过`socket`及`select`创建非阻塞连接，并发送http请求到服务器。
- 在并发(parallel)模式下，最大连接数为并发数，在主循环里依次开启连接。
- 在频率(rate)模式下，间隔`(1000/rate)`毫秒开启一次连接。
- 定时(second)模式下，到时间关闭连接。
- 计数(fetchs)模式下，在主循环中第一个判断是否完成，完成关闭连接
