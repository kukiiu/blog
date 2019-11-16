---
date: 2018-11-7
tag: 
  - nginx
author: kukiiu
location: ShenZhen  
---
# nginx常用配置
```shell
# 将以 /tag/开头的Url转发到http://www.tag.com/上
server {
	location ^~ /tag/ {
        	proxy_pass http://www.tag.com/;
    	}
}
```

# 跨域支持
```shell
server {
	location / {
		add_header 'Access-Control-Allow-Origin' '*'; #允许来自所有的访问地址
		add_header 'Access-Control-Allow-Credentials' 'true';
		add_header 'Access-Control-Allow-Methods' 'GET, PUT, POST, DELETE, OPTIONS'; #支持请求方式
		add_header 'Access-Control-Allow-Headers' 'Content-Type,*';
    	}
}
```