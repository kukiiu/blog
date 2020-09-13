# Mysql8.0环境搭建

* Mysql目录结构（TODO）
* Linux下通过Docker安装
* 源码安装（TODO）
* Linux下通过apt安装

## Linux下通过Docker安装
---
### docker安装
```
shell> curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun

sudo cat > /etc/docker/daemon.json << EOF
{
   "registry-mirrors": ["https://pee6w651.mirror.aliyuncs.com"]
}
EOF

sudo service docker restart
```

### 镜像拉取
可用版本: https://hub.docker.com/_/mysql?tab=tags
```
shell> docker pull mysql:8.0.20
```

### 创建目录
```
shell> mkdir 3306
shell> cd 3306
shell> mkdir conf data logs mysql-files
shell> chmod 777 logs

shell> cat > conf/my.cnf << EOF
[mysqld]
datadir = /var/lib/mysql
log_error=/logs/mysql.log
EOF
```

### 运行
```
shell> docker run -itd \
--name mysql3306 \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=123456 \
-v $PWD/conf:/etc/mysql \
-v $PWD/logs:/logs \
-v $PWD/data:/var/lib/mysql \
-v $PWD/mysql-files:/var/lib/mysql-files \
mysql:8.0.20
```
* -p 3306:3306：将容器的 3306 端口映射到主机的 3306 端口。
* -v $PWD/conf:/etc/mysql ：将主机当前目录下的 conf/my.cnf 挂载到* 容器的 /etc/mysql/my.cnf。
* -v $PWD/logs:/logs ：将主机当前目录下的 logs 目录挂载到容器的 /* logs。
* -v $PWD/data:/var/lib/mysql ：将主机当前目录下的data目录挂载到容* 器的 /var/lib/mysql 。
* -v $PWD/mysql-files:/var/lib/mysql-files ：。
* -e MYSQL_ROOT_PASSWORD=123456：初始化 root 用户的密码。

### 常用操作 
```
// 进入容器
shell> docker exec -it mysql3306 mysql -uroot -p123456
// 删除容器
shell> docker rm -f mysql3306
```

## 源码安装
---


## Linux下通过apt安装
---
### 安装
```
// 更新mysql源
shell> wget https://dev.mysql.com/get/mysql-apt-config_0.8.15-1_all.deb
shell> sudo dpkg -i mysql-apt-config_0.8.15-1_all.deb
shell> sudo apt-get update
shell> dpkg -l | grep mysql
// 安装
shell> sudo apt-get install mysql-server
```
### 运行
```
shell> mysqladmin --version
shell> sudo service mysql start
shell> sudo service mysql status
shell> sudo service mysql stop
```
### 安装目录
- /usr/sbin/mysqld
- /etc/mysql
- /var/run/mysqld/mysqld.pid    // pid-file
- /var/run/mysqld/mysqld.sock   // socket
- /var/lib/mysql                // datadir
- /var/log/mysql/error.log      // log-error

### 卸载
```
shell> sudo apt-get remove mysql-server
shell> sudo apt-get autoremove
shell> sudo rm /etc/mysql/ -R
shell> sudo rm /v/ar/lib/mysql -R
```


## 8.0安装问题
### mysql客户端工具不支持8.0密码
```
shell> alter user 'root'@'%' identified with mysql_native_password by '123456';
shell> flush privileges;
```