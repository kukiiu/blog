# CPU基准测试

## sysbench测试(v1.0.18)
### 查看帮助
`>> sysbench cpu help`
```
cpu options:
  --cpu-max-prime=N 指定最大的素数，具体参数可以根据CPU的性能来设置，默认为10000
```

### 测试执行
`>> sysbench cpu --cpu-max-prime=1000 run`
```
Running the test with following options:
Number of threads: 1
Initializing random number generator from current time

Prime numbers limit: 1000

Initializing worker threads...

Threads started!

CPU speed:
    events per second: 13124.53     # 每秒执行次数

General statistics:
    total time:                          10.0001s
    total number of events:              131298     # 总执行次数

Latency (ms):
         min:                                    0.03
         avg:                                    0.08
         max:                                   44.50
         95th percentile:                        0.14
         sum:                                 9937.15

Threads fairness:
    events (avg/stddev):           131298.0000/0.00 #平均每个线程完成envet的次数，后一个值是标准差
    execution time (avg/stddev):   9.9372/0.00 #平均每个线程平均耗时，后一个值是标准差
```

### 原理
sysbench使用计算质素方法来测试，代码如下：
```c++
/* Upper limit for primes */
static unsigned int    max_prime;

int cpu_execute_event()
{
  unsigned long long c;
  unsigned long long l;
  double t;
  unsigned long long n=0;

  for(c=3; c < max_prime; c++)
  {
    t = sqrt((double)c);
    for(l = 2; l <= t; l++)
      if (c % l == 0)
        break;
    if (l > t )
      n++; 
  }

  return 0;
}
```

## 高级测试对比
- CPU参数
- threads的影响
- time的影响

sysbench cpu --report-interval=1 --threads=1 --cpu-max-prime=10000 run

### 测试机1
```
root@iZwz906mwzk44ymohnr8pcZ:~# lscpu
Architecture:        x86_64
CPU op-mode(s):      32-bit, 64-bit
Byte Order:          Little Endian
CPU(s):              1
On-line CPU(s) list: 0
Thread(s) per core:  1
Core(s) per socket:  1
Socket(s):           1
NUMA node(s):        1
Vendor ID:           GenuineIntel
CPU family:          6
Model:               79
Model name:          Intel(R) Xeon(R) CPU E5-2682 v4 @ 2.50GHz
Stepping:            1
CPU MHz:             2499.996
BogoMIPS:            4999.99
Hypervisor vendor:   KVM
Virtualization type: full
L1d cache:           32K
L1i cache:           32K
L2 cache:            256K
L3 cache:            40960K
NUMA node0 CPU(s):   0
```
```
root@iZwz906mwzk44ymohnr8pcZ:~# sysbench cpu --report-interval=1 --threads=1 --cpu-max-prime=10000 run
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta2)

Running the test with following options:
Number of threads: 1
Report intermediate results every 1 second(s)
Initializing random number generator from current time

Prime numbers limit: 10000

Initializing worker threads...

Threads started!

[ 1s ] thds: 1 eps: 960.09 lat (ms,95%): 1.06
[ 2s ] thds: 1 eps: 789.13 lat (ms,95%): 1.06
[ 3s ] thds: 1 eps: 962.27 lat (ms,95%): 1.08
[ 4s ] thds: 1 eps: 842.77 lat (ms,95%): 1.25
[ 5s ] thds: 1 eps: 942.23 lat (ms,95%): 1.18
[ 6s ] thds: 1 eps: 733.82 lat (ms,95%): 1.23
[ 7s ] thds: 1 eps: 930.95 lat (ms,95%): 1.21
[ 8s ] thds: 1 eps: 745.45 lat (ms,95%): 1.23
[ 9s ] thds: 1 eps: 940.40 lat (ms,95%): 1.23
[ 10s ] thds: 1 eps: 763.20 lat (ms,95%): 1.12
CPU speed:
    events per second:   859.96

General statistics:
    total time:                          10.0243s
    total number of events:              8622

Latency (ms):
         min:                                    1.02
         avg:                                    1.16
         max:                                  223.71
         95th percentile:                        1.18
         sum:                                10013.42

Threads fairness:
    events (avg/stddev):           8622.0000/0.00
    execution time (avg/stddev):   10.0134/0.00
```
```
root@iZwz906mwzk44ymohnr8pcZ:~# sysbench cpu --report-interval=1 --threads=8 --cpu-max-prime=10000 run
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta2)

Running the test with following options:
Number of threads: 8
Report intermediate results every 1 second(s)
Initializing random number generator from current time


Prime numbers limit: 10000

Initializing worker threads...

Threads started!

[ 1s ] thds: 8 eps: 930.10 lat (ms,95%): 29.19
[ 2s ] thds: 8 eps: 841.02 lat (ms,95%): 29.19
[ 3s ] thds: 8 eps: 936.03 lat (ms,95%): 29.19
[ 4s ] thds: 8 eps: 724.02 lat (ms,95%): 25.28
[ 5s ] thds: 8 eps: 940.97 lat (ms,95%): 29.19
[ 6s ] thds: 8 eps: 798.97 lat (ms,95%): 25.28
[ 7s ] thds: 8 eps: 928.00 lat (ms,95%): 29.19
[ 8s ] thds: 8 eps: 728.02 lat (ms,95%): 25.28
[ 9s ] thds: 8 eps: 925.95 lat (ms,95%): 29.19
CPU speed:
    events per second:   850.83

General statistics:
    total time:                          10.0061s
    total number of events:              8515

Latency (ms):
         min:                                    1.02
         avg:                                    9.39
         max:                                 1795.43
         95th percentile:                       29.19
         sum:                                79922.32

Threads fairness:
    events (avg/stddev):           1064.3750/82.32
    execution time (avg/stddev):   9.9903/0.01
```

### 测试机2
```
root@iZwz97fvri6ov7elpqvizcZ:~# lscpu
Architecture:          x86_64
CPU op-mode(s):        32-bit, 64-bit
Byte Order:            Little Endian
CPU(s):                2
On-line CPU(s) list:   0,1
Thread(s) per core:    2
Core(s) per socket:    1
Socket(s):             1
NUMA node(s):          1
Vendor ID:             GenuineIntel
CPU family:            6
Model:                 85
Model name:            Intel(R) Xeon(R) Platinum 8163 CPU @ 2.50GHz
Stepping:              4
CPU MHz:               2499.994
BogoMIPS:              4999.98
Hypervisor vendor:     KVM
Virtualization type:   full
L1d cache:             32K
L1i cache:             32K
L2 cache:              1024K
L3 cache:              33792K
NUMA node0 CPU(s):     0,1
```
```
root@iZwz97fvri6ov7elpqvizcZ:~# sysbench cpu --report-interval=1 --threads=1 --cpu-max-prime=10000 run
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta2)

Running the test with following options:
Number of threads: 1
Report intermediate results every 1 second(s)
Initializing random number generator from current time


Prime numbers limit: 10000

Initializing worker threads...

Threads started!

[ 1s ] thds: 1 eps: 916.11 lat (ms,95%): 1.12
[ 2s ] thds: 1 eps: 922.35 lat (ms,95%): 1.10
[ 3s ] thds: 1 eps: 922.99 lat (ms,95%): 1.10
[ 4s ] thds: 1 eps: 923.00 lat (ms,95%): 1.10
[ 5s ] thds: 1 eps: 922.96 lat (ms,95%): 1.10
[ 6s ] thds: 1 eps: 924.04 lat (ms,95%): 1.10
[ 7s ] thds: 1 eps: 927.00 lat (ms,95%): 1.10
[ 8s ] thds: 1 eps: 926.99 lat (ms,95%): 1.10
[ 9s ] thds: 1 eps: 925.98 lat (ms,95%): 1.10
CPU speed:
    events per second:   915.74

General statistics:
    total time:                          10.0002s
    total number of events:              9159

Latency (ms):
         min:                                    1.07
         avg:                                    1.09
         max:                                    3.75
         95th percentile:                        1.10
         sum:                                 9994.61

Threads fairness:
    events (avg/stddev):           9159.0000/0.00
    execution time (avg/stddev):   9.9946/0.00
```
```
root@iZwz97fvri6ov7elpqvizcZ:~# sysbench cpu --report-interval=1 --threads=2 --cpu-max-prime=10000 run
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta2)

Running the test with following options:
Number of threads: 2
Report intermediate results every 1 second(s)
Initializing random number generator from current time


Prime numbers limit: 10000

Initializing worker threads...

Threads started!

[ 1s ] thds: 2 eps: 1362.51 lat (ms,95%): 1.58
[ 2s ] thds: 2 eps: 1369.51 lat (ms,95%): 1.58
[ 3s ] thds: 2 eps: 1368.04 lat (ms,95%): 1.58
[ 4s ] thds: 2 eps: 1301.03 lat (ms,95%): 1.58
[ 5s ] thds: 2 eps: 1135.92 lat (ms,95%): 2.86
[ 6s ] thds: 2 eps: 1362.06 lat (ms,95%): 1.58
[ 7s ] thds: 2 eps: 1369.01 lat (ms,95%): 1.58
[ 8s ] thds: 2 eps: 1369.06 lat (ms,95%): 1.58
[ 9s ] thds: 2 eps: 1369.91 lat (ms,95%): 1.58
CPU speed:
    events per second:  1337.73

General statistics:
    total time:                          10.0011s
    total number of events:              13381

Latency (ms):
         min:                                    1.08
         avg:                                    1.49
         max:                                   12.73
         95th percentile:                        1.58
         sum:                                19988.89

Threads fairness:
    events (avg/stddev):           6690.5000/225.50
    execution time (avg/stddev):   9.9944/0.00
```
```
root@iZwz97fvri6ov7elpqvizcZ:~# sysbench cpu --report-interval=1 --threads=8 --cpu-max-prime=10000 run
sysbench 1.0.20 (using bundled LuaJIT 2.1.0-beta2)

Running the test with following options:
Number of threads: 8
Report intermediate results every 1 second(s)
Initializing random number generator from current time


Prime numbers limit: 10000

Initializing worker threads...

Threads started!

[ 1s ] thds: 8 eps: 1361.80 lat (ms,95%): 18.61
[ 2s ] thds: 8 eps: 1366.98 lat (ms,95%): 19.65
[ 3s ] thds: 8 eps: 1372.14 lat (ms,95%): 21.50
[ 4s ] thds: 8 eps: 1368.85 lat (ms,95%): 20.00
[ 5s ] thds: 8 eps: 1370.98 lat (ms,95%): 20.37
[ 6s ] thds: 8 eps: 1368.16 lat (ms,95%): 21.50
[ 7s ] thds: 8 eps: 1371.87 lat (ms,95%): 21.11
[ 8s ] thds: 8 eps: 1356.00 lat (ms,95%): 18.28
[ 9s ] thds: 8 eps: 1369.08 lat (ms,95%): 17.63
CPU speed:
    events per second:  1367.86

General statistics:
    total time:                          10.0045s
    total number of events:              13687

Latency (ms):
         min:                                    1.10
         avg:                                    5.84
         max:                                   36.66
         95th percentile:                       19.29
         sum:                                79901.65

Threads fairness:
    events (avg/stddev):           1710.8750/60.28
    execution time (avg/stddev):   9.9877/0.01
```