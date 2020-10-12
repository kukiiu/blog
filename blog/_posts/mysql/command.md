## 命令
* 安全关闭 `>> mysqladmin -u root -p shutdown`
* 安全启动 `>> safe_mysqld & `

* 查看mysql路径 `>> which mysqld`

* 查看配置文件 `>> /usr/sbin/mysqld --verbose --help | grep -A 1 'Default options'`

* 配置命令行提示 `SQL>> prompt \r:\m:\s \u@\h [\d]>`

* 查看版本 `SQL>> select version();`

* 查看变量 `SQL>> show variables like '%...%'`

* 查看状态 `SQL>> show status like '%...%'`

* 查看mysql日志
`SQL>> SHOW VARIABLES LIKE 'general%';`
`SQL>> set GLOBAL general_log='ON';`

* 查看慢查询
`>> show variables like '%slow%';`
`>> show variables like 'long_query_time';`
`>> set global slow_query_log=1;`
`>> set global long_query_time=1;`
`>> select sleep(1) as a, 1 as b;`

* 查看临时表生成情况 `SQL>> show status like 'Created%';`
