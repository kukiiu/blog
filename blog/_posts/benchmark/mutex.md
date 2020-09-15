# mutex互斥锁测试
互斥锁是一种数据结构，用来对资源进行排他性访问控制。

测试互斥锁的性能，方法是模拟所有线程在同一时刻并发允许，并都短暂请求互斥锁。

```
>> sysbench mutex help
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

mutex options:
  --mutex-num=N   total size of mutex array [4096]
  --mutex-locks=N number of mutex locks to do per thread [50000]
  --mutex-loops=N number of empty loops to do outside mutex lock [10000]
```

### 测试
```
>> sysbench mutex run
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

Running the test with following options:
Number of threads: 1
Initializing random number generator from current time

Initializing worker threads...

Threads started!

General statistics:
    total time:                          0.2019s
    total number of events:              1

Latency (ms):
         min:                                  201.41
         avg:                                  201.41
         max:                                  201.41
         95th percentile:                      200.47
         sum:                                  201.41

Threads fairness:
    events (avg/stddev):           1.0000/0.00
    execution time (avg/stddev):   0.2014/0.00
```

