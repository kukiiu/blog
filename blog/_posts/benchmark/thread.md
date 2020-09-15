# 线程
测试线程调度器的性能。

## 线程测试
```
>> sysbench threads help
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

threads options:
  --thread-yields=N number of yields to do per request [1000]
  --thread-locks=N  number of locks per thread [8]
```

### 测试
```
>> sysbench threads run
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

Running the test with following options:
Number of threads: 1
Initializing random number generator from current time

Initializing worker threads...

Threads started!

General statistics:
    total time:                          10.0009s
    total number of events:              8592

Latency (ms):
         min:                                    0.47
         avg:                                    1.16
         max:                                   13.61
         95th percentile:                        2.22
         sum:                                 9987.29

Threads fairness:
    events (avg/stddev):           8592.0000/0.00
    execution time (avg/stddev):   9.9873/0.00
```