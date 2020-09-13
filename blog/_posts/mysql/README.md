# 目录
## 基础篇
- 环境搭建(TODO)
- mysql权限管理(NO)
- mysql配置文件(TODO)
- binlog(NO)
- redolog(NO)
- undolog(NO)
- change buffer(NO)
- double write(NO)
- adaptive hash index(NO)
- explain/MRR/BKA(NO)
- for update(NO)

## sysbench使用
-- 基础介绍(TODO)

## 其他
- 表锁行锁测试
- 引擎源码？

## 待处理问题
* 如何做基准测试
    - 收集要测试的内容
    - 每种指标的意义
    - 各种工具的使用
    - 设计测试方案
    - 自动测试分析

## 其他话题
* mysql启动方式/停止
* linux下mysql运行状态查看
* mysql配置文件
* mysql逻辑架构
* 引擎源码探究
* sqlite源码研究
* tools.percona.com
* 复制
* 扩展

## 难点
- 知识点太杂
- 动手操作环境麻烦
- 例子太少
- 精通不明确
- 对开发不友好
- 并发(测试应用在不同并发数下的性能）/多核/多线程
- 基准测试/压力测试
- 吞吐量TPS
- TPC标准
- 执行时间/等待时间
- 多少时间是可接受的性能
- 流量类比交通？
- 排序索引？临时表优化

## 方向
- 业务表的设计
- 复杂查询/复杂统计
- 锁冲突
- 性能监控

## 工具
- ab
- http_loader
- sysbench
- pt-online-schema-change
- Ifp

## 数量
- Innodb单机存放5TB都没问题
- 10TB以上用TokuDB
- 机械磁盘每秒只能百次随机读
- 数据批量删除一次一万行最好
- 100个左右分区是合适的

## 教程
- RBAC设计实现
- OAuth设计实现
- 聊天室设计
- 任务系统设计
