# 内存测试-memory 
测试内存连续读写能力

```
>> sysbench memory help
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

memory options:
  --memory-block-size=SIZE    测试内存块的大小，默认为1K
  --memory-total-size=SIZE    数据传输的总大小，默认为100G
  --memory-scope=STRING       内存访问的范围，包括global和local，默认为global {global,local} [global]
  --memory-hugetlb[=on|off]   是否从HugeTLB池分配内存的开关，默认为off
  --memory-oper=STRING        操作内存的类型，包括read, write, none，默认为write
  --memory-access-mode=STRING m内存访问模式，包括seq,rnd，默认为seq
```

### 测试
```
>> sysbench memory --memory-total-size=1G run
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

Running the test with following options:
Number of threads: 1
Initializing random number generator from current time


Running memory speed test with the following options:
  block size: 1KiB
  total size: 1024MiB
  operation: write
  scope: global

Initializing worker threads...

Threads started!

Total operations: 1048576 (5149860.19 per second)

1024.00 MiB transferred (5029.16 MiB/sec)


General statistics:
    total time:                          0.2018s
    total number of events:              1048576

Latency (ms):
         min:                                    0.00
         avg:                                    0.00
         max:                                    0.21
         95th percentile:                        0.00
         sum:                                   96.02

Threads fairness:
    events (avg/stddev):           1048576.0000/0.00
    execution time (avg/stddev):   0.0960/0.00
```
