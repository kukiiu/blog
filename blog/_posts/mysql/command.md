## 命令
* 查看mysql路径
```
>> which mysqld
```

* 查看配置文件
```
>> /usr/sbin/mysqld --verbose --help | grep -A 1 'Default options'
```

* 查看mysql日志
```
SQL>> SHOW VARIABLES LIKE 'general%';
SQL>> set GLOBAL general_log='OFF';
```

* 查看临时表生成情况 ```SQL>> show status like 'Created%';```