# OLTP在线事务处理


## TPC-C
TPC-C是TPC组织发布的一个测试规范，用于模拟测试复杂的在线事务处理系统(OLTP)。它的测试结果包括每分钟事务(tpmC)及每事务的成本(Price/tpmC)。这种测试的结果非常依赖硬件环境，所以公开发布的TPC-C测试结果都会包含具体的系统硬件配置信息。

TPC-C测试相较于sysbench可以模拟真实业务压力，tpcc-mysql工具。

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