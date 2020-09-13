# 基准测试工具sysbench
sysbench是基于LuaJIT的脚本化多线程基准测试工具，常用于数据库基准测试。包括以下内容：
- oltp_*.lua: OLTP-like的数据库基准测试脚本
- fileio: 文件系统IO基准测试
- cpu: CPU基准测试
- memory: 内存基准测试
- threads: a thread-based scheduler benchmark
- mutex: a POSIX mutex benchmark

## 特点
- extensive statistics about rate and latency is available, including latency percentiles and histograms;
- low overhead even with thousands of concurrent threads. sysbench is capable of generating and tracking hundreds of millions of events per second;
- new benchmarks can be easily created by implementing pre-defined hooks in user-provided Lua scripts;
- can be used as a general-purpose Lua interpreter as well, simply replace #!/usr/bin/lua with #!/usr/bin/sysbench in your script.

## 帮助
`>> sysbench --help`
```
Usage:
  sysbench [options]... [testname] [command]

Commands implemented by most tests: prepare run cleanup help

General options:
  --threads=N                     number of threads to use [1]
  --events=N                      limit for total number of events [0]
  --time=N                        limit for total execution time in seconds [10]
  --forced-shutdown=STRING        number of seconds to wait after the --time limit before forcing shutdown, or 'off' to disable [off]
  --thread-stack-size=SIZE        size of stack per thread [64K]
  --rate=N                        average transactions rate. 0 for unlimited rate [0]
  --report-interval=N             periodically report intermediate statistics with a specified interval in seconds. 0 disables intermediate reports [0]
  --report-checkpoints=[LIST,...] dump full statistics and reset all counters at specified points in time. The argument is a list of comma-separated values representing the amount of time in seconds elapsed from start of test when report checkpoint(s) must be performed. Report checkpoints are off by default. []
  --debug[=on|off]                print more debugging info [off]
  --validate[=on|off]             perform validation checks where possible [off]
  --help[=on|off]                 print help and exit [off]
  --version[=on|off]              print version and exit [off]
  --config-file=FILENAME          File containing command line options
  --tx-rate=N                     deprecated alias for --rate [0]
  --max-requests=N                deprecated alias for --events [0]
  --max-time=N                    deprecated alias for --time [0]
  --num-threads=N                 deprecated alias for --threads [1]

Pseudo-Random Numbers Generator options:
  --rand-type=STRING random numbers distribution {uniform,gaussian,special,pareto} [special]
  --rand-spec-iter=N number of iterations used for numbers generation [12]
  --rand-spec-pct=N  percentage of values to be treated as 'special' (for special distribution) [1]
  --rand-spec-res=N  percentage of 'special' values to use (for special distribution) [75]
  --rand-seed=N      seed for random number generator. When 0, the current time is used as a RNG seed. [0]
  --rand-pareto-h=N  parameter h for pareto distribution [0.2]

Log options:
  --verbosity=N verbosity level {5 - debug, 0 - only critical messages} [3]

  --percentile=N       percentile to calculate in latency statistics (1-100). Use the special value of 0 to disable percentile calculations [95]
  --histogram[=on|off] print latency histogram in report [off]

General database options:

  --db-driver=STRING  specifies database driver to use ('help' to get list of available drivers) [mysql]
  --db-ps-mode=STRING prepared statements usage mode {auto, disable} [auto]
  --db-debug[=on|off] print database-specific debug information [off]


Compiled-in database drivers:
  mysql - MySQL driver
  pgsql - PostgreSQL driver

mysql options:
  --mysql-host=[LIST,...]          MySQL server host [localhost]
  --mysql-port=[LIST,...]          MySQL server port [3306]
  --mysql-socket=[LIST,...]        MySQL socket
  --mysql-user=STRING              MySQL user [sbtest]
  --mysql-password=STRING          MySQL password []
  --mysql-db=STRING                MySQL database name [sbtest]
  --mysql-ssl[=on|off]             use SSL connections, if available in the client library [off]
  --mysql-ssl-cipher=STRING        use specific cipher for SSL connections []
  --mysql-compression[=on|off]     use compression, if available in the client library [off]
  --mysql-debug[=on|off]           trace all client library calls [off]
  --mysql-ignore-errors=[LIST,...] list of errors to ignore, or "all" [1213,1020,1205]
  --mysql-dry-run[=on|off]         Dry run, pretend that all MySQL client API calls are successful without executing them [off]

pgsql options:
  --pgsql-host=STRING     PostgreSQL server host [localhost]
  --pgsql-port=N          PostgreSQL server port [5432]
  --pgsql-user=STRING     PostgreSQL user [sbtest]
  --pgsql-password=STRING PostgreSQL password []
  --pgsql-db=STRING       PostgreSQL database name [sbtest]

Compiled-in tests:
  fileio - File I/O test
  cpu - CPU performance test
  memory - Memory functions speed test
  threads - Threads subsystem performance test
  mutex - Mutex performance test

See 'sysbench <testname> help' for a list of options for each test.
```

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


## 内存测试-memory 
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

## mutex测试
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


## OLTP测试
### 查找文件目录
```
>> find / -name oltp_*
```

### 查看帮助文件
```
>> sysbench oltp_common.lua help
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

oltp_common.lua options:
  --auto_inc[=on|off]           Use AUTO_INCREMENT column as Primary Key (for MySQL), or its alternatives in other DBMS. When disabled, use client-generated IDs [on]
  --create_secondary[=on|off]   Create a secondary index in addition to the PRIMARY KEY [on]
  --delete_inserts=N            Number of DELETE/INSERT combinations per transaction [1]
  --distinct_ranges=N           Number of SELECT DISTINCT queries per transaction [1]
  --index_updates=N             Number of UPDATE index queries per transaction [1]
  --mysql_storage_engine=STRING Storage engine, if MySQL is used [innodb]
  --non_index_updates=N         Number of UPDATE non-index queries per transaction [1]
  --order_ranges=N              Number of SELECT ORDER BY queries per transaction [1]
  --pgsql_variant=STRING        Use this PostgreSQL variant when running with the PostgreSQL driver. The only currently supported variant is 'redshift'. When enabled, create_secondary is automatically disabled, and delete_inserts is set to 0
  --point_selects=N             Number of point SELECT queries per transaction [10]
  --range_selects[=on|off]      Enable/disable all range SELECT queries [on]
  --range_size=N                Range size for range SELECT queries [100]
  --secondary[=on|off]          Use a secondary index in place of the PRIMARY KEY [off]
  --simple_ranges=N             Number of simple range SELECT queries per transaction [1]
  --skip_trx[=on|off]           Don't start explicit transactions and execute all queries in the AUTOCOMMIT mode [off]
  --sum_ranges=N                Number of SELECT SUM() queries per transaction [1]
  --table_size=N                Number of rows per table [10000]
  --tables=N                    Number of tables [1]
```

### 数据准备与清除
- 创建数据库
```
mysql> create database sbtest;
Query OK, 1 row affected (2.47 sec)
```

- 创建数据
```
>> sysbench oltp_read_write.lua --tables=2 --table_size=1000000 --mysql-user=root --mysql-password=123456 --mysql-host=192.168.19.132 --mysql-port=3306 --mysql-db=sbtest prepare
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

Creating table 'sbtest1'...
Inserting 1000000 records into 'sbtest1'
Creating a secondary index on 'sbtest1'...
Creating table 'sbtest2'...
Inserting 1000000 records into 'sbtest2'
Creating a secondary index on 'sbtest2'...
```

- 清除测试
```
>> sysbench oltp_read_write.lua --tables=2 --mysql-user=root --mysql-password=123456 --mysql-host=192.168.19.132 --mysql-port=3306 --mysql-db=sbtest cleanup
```

### 测试
```
>> sysbench oltp_point_select.lua --tables=2 --table_size=1000000 --mysql-user=root --mysql-password=123456 --mysql-host=192.168.19.132 --mysql-port=3306 --mysql-db=sbtest --threads=64 --time=100 --report-interval=5 run
sysbench 1.0.18 (using system LuaJIT 2.1.0-beta3)

Running the test with following options:
Number of threads: 64
Report intermediate results every 5 second(s)
Initializing random number generator from current time

Initializing worker threads...

Threads started!

[ 5s ] thds: 64 tps: 1728.73 qps: 1728.73 (r/w/o: 1728.73/0.00/0.00) lat (ms,95%): 223.34 err/s: 0.00 reconn/s: 0.00
[ 10s ] thds: 64 tps: 4482.43 qps: 4482.43 (r/w/o: 4482.43/0.00/0.00) lat (ms,95%): 41.85 err/s: 0.00 reconn/s: 0.00
[ 15s ] thds: 64 tps: 5823.50 qps: 5823.50 (r/w/o: 5823.50/0.00/0.00) lat (ms,95%): 20.37 err/s: 0.00 reconn/s: 0.00
[ 20s ] thds: 64 tps: 6811.05 qps: 6811.05 (r/w/o: 6811.05/0.00/0.00) lat (ms,95%): 15.55 err/s: 0.00 reconn/s: 0.00
[ 25s ] thds: 64 tps: 6764.38 qps: 6764.38 (r/w/o: 6764.38/0.00/0.00) lat (ms,95%): 14.21 err/s: 0.00 reconn/s: 0.00
[ 30s ] thds: 64 tps: 8250.16 qps: 8250.16 (r/w/o: 8250.16/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 35s ] thds: 64 tps: 8382.85 qps: 8382.85 (r/w/o: 8382.85/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 40s ] thds: 64 tps: 8479.90 qps: 8479.90 (r/w/o: 8479.90/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 45s ] thds: 64 tps: 8496.01 qps: 8496.01 (r/w/o: 8496.01/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 50s ] thds: 64 tps: 8266.15 qps: 8266.15 (r/w/o: 8266.15/0.00/0.00) lat (ms,95%): 12.30 err/s: 0.00 reconn/s: 0.00
[ 55s ] thds: 64 tps: 8445.33 qps: 8445.33 (r/w/o: 8445.33/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 60s ] thds: 64 tps: 7443.54 qps: 7443.54 (r/w/o: 7443.54/0.00/0.00) lat (ms,95%): 13.95 err/s: 0.00 reconn/s: 0.00
[ 65s ] thds: 64 tps: 7611.65 qps: 7611.65 (r/w/o: 7611.65/0.00/0.00) lat (ms,95%): 13.95 err/s: 0.00 reconn/s: 0.00
[ 70s ] thds: 64 tps: 8438.79 qps: 8438.79 (r/w/o: 8438.79/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 75s ] thds: 64 tps: 8467.32 qps: 8467.32 (r/w/o: 8467.32/0.00/0.00) lat (ms,95%): 11.45 err/s: 0.00 reconn/s: 0.00
[ 80s ] thds: 64 tps: 8404.98 qps: 8404.98 (r/w/o: 8404.98/0.00/0.00) lat (ms,95%): 11.65 err/s: 0.00 reconn/s: 0.00
[ 85s ] thds: 64 tps: 8303.74 qps: 8303.74 (r/w/o: 8303.74/0.00/0.00) lat (ms,95%): 11.87 err/s: 0.00 reconn/s: 0.00
[ 90s ] thds: 64 tps: 8268.47 qps: 8268.47 (r/w/o: 8268.47/0.00/0.00) lat (ms,95%): 12.08 err/s: 0.00 reconn/s: 0.00
[ 95s ] thds: 64 tps: 8520.69 qps: 8520.69 (r/w/o: 8520.69/0.00/0.00) lat (ms,95%): 11.24 err/s: 0.00 reconn/s: 0.00
[ 100s ] thds: 64 tps: 8441.64 qps: 8441.64 (r/w/o: 8441.64/0.00/0.00) lat (ms,95%): 11.65 err/s: 0.00 reconn/s: 0.00
SQL statistics:
    queries performed:
        read:                            749223     #总的select数量
        write:                           0
        other:                           0
        total:                           749223
    transactions:                        749223 (7487.66 per sec.)  #TPS
    queries:                             749223 (7487.66 per sec.)  #QPS，TPS与QPS的大小基本一致，说明这个lua脚本中的一个查询一般就是一个事务！
    ignored errors:                      0      (0.00 per sec.)     #忽略的错误
    reconnects:                          0      (0.00 per sec.)     #重新连接

General statistics:
    total time:                          100.0596s
    total number of events:              749223

Latency (ms):
         min:                                    0.08
         avg:                                    8.54
         max:                                 7714.50
         95th percentile:                       12.75
         sum:                              6401035.77

Threads fairness:
    events (avg/stddev):           11706.6094/300.40
    execution time (avg/stddev):   100.0162/0.02
```