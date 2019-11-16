---
date: 2018-11-7
tag: 
  - php
author: kukiiu
location: ShenZhen  
---
# PHP Socket

## 知识点
* stream_socket_server - 创建一个Internet或Unix域服务器套接字
* stream_socket_accept - 接收一个通过stream_socket_server打开的连接
* fread - 从文件流中读取指定字节数据
* fwrite - 向文件流中写入指定字节数据
* fclose - 关闭文件流

## 创建服务器
```php
<?php
# server.php
$port = 12345;
$socket = stream_socket_server("tcp://127.0.0.1:$port", $errno, $errstr);
while($conn = stream_socket_accept($socket)) {
    echo "connect... \n";
    echo fread($conn, 1024);
    fwrite($conn, "server response..\n");
}
fclose($socket);
```

## 创建客户端
```php
<?php
# client.php
$port = 12345;
$MQTT_SERVER = "tcp://127.0.0.1:$port";
echo $MQTT_SERVER . "\n";
$socket = stream_socket_client($MQTT_SERVER,  $errno , $errstr) or die('connect error');
fwrite($socket, "client write");
echo fread($socket, 1024);
fclose($socket);
```
## 启动
> \> php server.php  
> \> php client.php  
