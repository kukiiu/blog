# mysql连接管理

## 连接管理线程
在Unix上，管理线程处理TCP/IP连接及socket连接请求，且有独立的网络接口处理管理员连接请求。
？？？

## 客户端连接线程管理
管理线程为每个客户端连接分配一个线程处理认证和请求。

管理线程从线程池中取出可用的线程或创建新的线程给新连接，

## 系统变量
* `thread_cache_size`: 代表线程缓存数量，0代表禁止缓存线程
* `thread_handling`: 处理线程方法
    - one-thread-per-connection: 每个连接分配一个线程
* `thread_stack`: 线程栈大小，默认258kb，复杂SQL语句等耗费内存的请求需要更多栈空间处理。

## 状态变量
* `Threads_cached`: 当前未使用的线程数量
* `Threads_connected`: 当前线程连接数量
* `Threads_created`: 当前线程创建数量
* `Threads_running`: 当前正在执行请求的线程数量

## 系统变量
* `max_connections`: 限制最大连接数
* `Connection_errors_max_connections`: 超最大连接数数量
* `Connection_errors_xxx`: 连接错误

## 管理员连接管理

## performance_schema.host_cache