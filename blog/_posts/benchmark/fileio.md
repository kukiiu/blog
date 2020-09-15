# 文件I/O基准测试
用于比较不同的硬盘、RAID等，sysbench的I/O测试和Innodb的I/O模式非常类似，在测试时需要注意：
- 测试预热时间不能太少，通常要3个小时I/O性能才平稳。
- 测试数据要比内存大，操作系统会缓存数据，导致测试结果无法体现I/O密集型的工作负载。


## 文件系统IO测试-fileio
```
>> sysbench fileio help
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

fileio options:
  --file-num=N                  生成测试文件的数量，默认128
  --file-block-size=N           测试时所使用文件块的大小，如果想磁盘针对innodb存储引擎进行测试，可以将其设置为16384，即innodb存储引擎页的大小。默认16384
  --file-total-size=SIZE        创建测试文件的总大小，默认为2G
  --file-test-mode=STRING       文件测试模式：seqwr(顺序写), seqrewr(顺序读写), seqrd(顺序读), rndrd(随机读), rndwr(随机写), rndrw(随机读写)
  --file-io-mode=STRING         文件操作的模式，sync（同步）,async（异步）,mmap（mmap），默认为sync同步模式
  --file-async-backlog=N        对应每个线程队列的异步操作数，默认为128。
  --file-extra-flags=[LIST,...] 打开文件时的额外选项。 {sync,dsync,direct} []
  --file-fsync-freq=N           多少次请求执行一次fsync()函数。fsync主要是同步磁盘文件，因为可能有系统和磁盘缓冲的关系。 0代表不使用fsync函数。默认值为100。
  --file-fsync-all[=on|off]     每执行完一次写操作，就执行一次fsync。默认为off。
  --file-fsync-end[=on|off]     在测试结束时执行fsync函数。默认为on。
  --file-fsync-mode=STRING      文件同步函数的选择，由于多个操作系统对于fdatasync支持不同，因此不建议使用fdatasync。默认为fsync。
  --file-merged-requests=N      merge at most this number of IO requests if possible (0 - don't merge) [0]
  --file-rw-ratio=N             测试时的读写比例，默认为1.5，即3：2。
```

### 数据准备(prepare)
指定创建10个文件，文件总大小为2G
```
>> sysbench fileio --file-num=10 --file-total-size=2G prepare
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

10 files, 209715Kb each, 2047Mb total
Creating files for the test...
Extra file open flags: (none)
Creating file test_file.0
...
Creating file test_file.9
2147614720 bytes written in 7.87 seconds (260.39 MiB/sec).
```

### 清除测试文件
```
>> sysbench fileio cleanup
```

### 随机读测试
```
>> sysbench fileio --file-num=10 --file-total-size=2G --file-test-mode=rndrw --report-interval=1 run
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

Running the test with following options:
Number of threads: 1
Report intermediate results every 1 second(s)
Initializing random number generator from current time

Extra file open flags: (none)
10 files, 204.8MiB each
2GiB total file size
Block size 16KiB
Number of IO requests: 0
Read/Write ratio for combined random IO test: 1.50
Periodic FSYNC enabled, calling fsync() each 100 requests.
Calling fsync() at the end of test, Enabled.
Using synchronous I/O mode
Doing random r/w test
Initializing worker threads...

Threads started!

[ 1s ] reads: 29.42 MiB/s writes: 19.62 MiB/s fsyncs: 308.01/s latency (ms,95%): 0.741
[ 2s ] reads: 23.10 MiB/s writes: 15.38 MiB/s fsyncs: 247.87/s latency (ms,95%): 0.989
[ 3s ] reads: 19.51 MiB/s writes: 13.00 MiB/s fsyncs: 208.80/s latency (ms,95%): 1.082
[ 4s ] reads: 24.32 MiB/s writes: 16.22 MiB/s fsyncs: 258.04/s latency (ms,95%): 1.063
[ 5s ] reads: 29.42 MiB/s writes: 19.63 MiB/s fsyncs: 314.12/s latency (ms,95%): 0.826
[ 6s ] reads: 23.99 MiB/s writes: 15.98 MiB/s fsyncs: 252.75/s latency (ms,95%): 0.888
[ 7s ] reads: 28.74 MiB/s writes: 19.16 MiB/s fsyncs: 305.81/s latency (ms,95%): 0.826
[ 8s ] reads: 24.63 MiB/s writes: 16.43 MiB/s fsyncs: 264.61/s latency (ms,95%): 0.920
[ 9s ] reads: 31.50 MiB/s writes: 21.00 MiB/s fsyncs: 337.80/s latency (ms,95%): 0.702
[ 10s ] reads: 21.99 MiB/s writes: 14.66 MiB/s fsyncs: 233.74/s latency (ms,95%): 1.007

File operations:
    reads/s:                      1640.13
    writes/s:                     1093.42
    fsyncs/s:                     273.46

Throughput:
    read, MiB/s:                  25.62
    written, MiB/s:               17.08

General statistics:
    total time:                          10.0173s
    total number of events:              30131

Latency (ms):
         min:                                    0.00
         avg:                                    0.33
         max:                                   93.96
         95th percentile:                        0.89
         sum:                                 9918.92

Threads fairness:
    events (avg/stddev):           30131.0000/0.00
    execution time (avg/stddev):   9.9189/0.00
```
