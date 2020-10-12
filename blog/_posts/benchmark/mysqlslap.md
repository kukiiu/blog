# mysqlslap基准测试

## 案例1
- 指定创建语句
- 指定查询语句
- 10个并发
- 循环执行2次
`mysqlslap --delimiter=";" --create="CREATE TABLE a (b int);INSERT INTO a VALUES (23)" --query="SELECT * FROM a" --concurrency=10 --iterations=2`

```
2020-09-30T03:56:10.528460Z	  177 Query	CREATE SCHEMA `mysqlslap`
2020-09-30T03:56:10.567169Z	  177 Init DB	mysqlslap
2020-09-30T03:56:10.567297Z	  177 Query	CREATE TABLE a (b int)
2020-09-30T03:56:11.044149Z	  177 Query	INSERT INTO a VALUES (23)
2020-09-30T03:56:11.183897Z	  223 Connect	root@localhost on mysqlslap using Socket
2020-09-30T03:56:11.213060Z	  224 Connect	root@localhost on mysqlslap using Socket
2020-09-30T03:56:11.216067Z	  226 Connect	root@localhost on mysqlslap using Socket
2020-09-30T03:56:11.312766Z	  224 Query	SELECT * FROM a
2020-09-30T03:56:11.358352Z	  223 Query	SELECT * FROM a
2020-09-30T03:56:11.454349Z	  227 Connect	root@localhost on mysqlslap using Socket
2020-09-30T03:56:11.467729Z	  225 Connect	root@localhost on mysqlslap using Socket
2020-09-30T03:56:11.594960Z	  226 Query	SELECT * FROM a
2020-09-30T03:56:11.594981Z	  227 Query	SELECT * FROM a
2020-09-30T03:56:11.595042Z	  223 Quit	
2020-09-30T03:56:11.623461Z	  225 Query	SELECT * FROM a
2020-09-30T03:56:11.653971Z	  226 Quit	
2020-09-30T03:56:11.672339Z	  227 Quit	
2020-09-30T03:56:11.675111Z	  225 Quit	
2020-09-30T03:56:11.681624Z	  177 Query	DROP SCHEMA IF EXISTS `mysqlslap`
```

```
Benchmark
	Average number of seconds to run all queries: 0.249 seconds
	Minimum number of seconds to run all queries: 0.058 seconds
	Maximum number of seconds to run all queries: 0.602 seconds
	Number of clients running queries: 5
	Average number of queries per client: 1
```


## 案例2
- 5个并发
- 循环2次
- 自动生成2个int，3个char
`mysqlslap -uroot -p123456 --concurrency=5 --iterations=2 --number-int-cols=2 --number-char-cols=3 --auto-generate-sql`

```
2020-09-30T04:04:07.752322Z	  249 Query	CREATE SCHEMA `mysqlslap`
2020-09-30T04:04:07.803047Z	  249 Init DB	mysqlslap
2020-09-30T04:04:07.806840Z	  249 Query	CREATE TABLE `t1` (intcol1 INT(32) ,intcol2 INT(32) ,charcol1 VARCHAR(128),charcol2 VARCHAR(128),charcol3 VARCHAR(128))
2020-09-30T04:04:08.329758Z	  249 Query	INSERT INTO t1 VALUES (1804289383,846930886,'xvtvmC9127qJNm06sGB8R92q2j7vTiiITRDGXM9ZLzkdekbWtmXKwZ2qG1llkRw5m9DHOFilEREk3q7oce8O3BEJC0woJsm6uzFAEynLH2xCsw1KQ1lT4zg9rdxBLb','97RGHZ65mNzkSrYT3zWoSbg9cNePQr1bzSk81qDgE4Oanw3rnPfGsBHSbnu1evTdFDe83ro9w4jjteQg4yoo9xHck3WNqzs54W5zEm92ikdRF48B2oz3m8gMBAl11W','y50w46i58Giekxik0cYzfA8BZBLADEg3JhzGfZDoqvQQk0Akcic7lcJInYSsf9wqin6LDC1vzJLkJXKn5onqOy04MTw1WksCYqPl2Jg2eteqOqTLfGCvE4zTZwWvgM')
...
2020-09-30T04:04:11.462452Z	  249 Query	INSERT INTO t1 VALUES (117413002,1471398403,'IAbYPhvXrb8zNjcHym2PXqgASMoyHAhbK80dhv1ZN9Oestwqfq7AYgK0u0yBBffNff1CQudp32SnvGWa6Tce9wevpS707eFeH8qb2SPxMld917jzcJTe77ZwbYoaAw','4Jwmvz6CoSxPdqYCp1NIXNHwBkTsAXo6jksWbzaOJXppDE12FHCmgLar53b7RND20xORwyr8TZxinqcu7gYf16Ny2y5TMANE7nhwlP46y1glr8froBWpHtfBscY6mv','KlathJIdHGextM5ODlRbQlT5oDZLJJGXxrOW2b8Krm9d0F1DsTpJ6AGuNqFa1O5yFLT9wdTgFfHGmILef2pl46YRwn1xBywIKHSGmpw1S596GXdvPQZWY5pSsjIwh6')
2020-09-30T04:04:11.507196Z	  256 Connect	root@localhost on mysqlslap using Socket
2020-09-30T04:04:11.518990Z	  255 Connect	root@localhost on mysqlslap using Socket
2020-09-30T04:04:11.519348Z	  257 Connect	root@localhost on mysqlslap using Socket
2020-09-30T04:04:11.520875Z	  258 Connect	root@localhost on mysqlslap using Socket
2020-09-30T04:04:11.521428Z	  259 Connect	root@localhost on mysqlslap using Socket
2020-09-30T04:04:11.598939Z	  256 Query	INSERT INTO t1 VALUES (1233983202,789373855,'jdtPbBILRQyiu7nZN3RdI96aQOP4Y0z7dlO4wbQF1OpvYdLnggGrqMP8mjCAjB9CwQHk1jruzhhXA2BibRZPqrPSQdX9gYDTyWDr5xdxWJSgDXEozg5hNW1pzYqgx3','9nQEfN38KZRh5hCCL3sRkFpm4pAuL7pWvFcQXgar52O3bdFwY7FHE53ImD47LtT81xaYT8Fb2YWd1lQZshqyelGOzCNCxsCyimMBmWep28IvlkSTIJRw4bDvnczlLB','bvpq6cCdH6db1NCTsWgKIdvXOb0OKDRn8HdEthjAnLdochAS3qgMJclk3d0FqR2ykY5dDof119pdqz6mie816ld9NdO55R4pr9J4pq5rrnSieQSK5SEB5rLKTlQQ4M')
2020-09-30T04:04:11.893989Z	  255 Query	SELECT intcol1,intcol2,charcol1,charcol2,charcol3 FROM t1
2020-09-30T04:04:11.906170Z	  259 Query	SELECT intcol1,intcol2,charcol1,charcol2,charcol3 FROM t1
2020-09-30T04:04:11.917338Z	  255 Query	INSERT INTO t1 VALUES (2101913295,1100418235,'XQ0K9x30cYaFq2RvMZzKHKgmxy4uKBpreh4fX7f7XEEM8a9Nz8jGKFuAEy4aAtIgREJyDyxl44zDe8Sd9BmTIgfYfjzpTHTwNgmcejDbnCgHD8nMBZjT5N2kytPJ2m','7PQt1xTFY8JCIYK5uXWWsbtmCjfdvhO2yiosf9zB9IFRjbOTyuzjMkTaS93NiJHZ25PZ6OdGasjHK0nAmmt8XNarOe6yxFXzDoZJ42bfuBoEBRHpEAydPOKp2Ig0ZB','rmsG6wIZR5kGBnjSTpfJIwjeemwIeMLL8De6AogdtGl5wTZPA4kTtR7X5wpjIAxIGbPIN5n9LZEHufa4cIPTePsjLhJXjGprjE9yBxzZWDiGl9CDReax3QZGzsni0S')
2020-09-30T04:04:11.940832Z	  259 Query	INSERT INTO t1 VALUES (2101913295,1100418235,'XQ0K9x30cYaFq2RvMZzKHKgmxy4uKBpreh4fX7f7XEEM8a9Nz8jGKFuAEy4aAtIgREJyDyxl44zDe8Sd9BmTIgfYfjzpTHTwNgmcejDbnCgHD8nMBZjT5N2kytPJ2m','7PQt1xTFY8JCIYK5uXWWsbtmCjfdvhO2yiosf9zB9IFRjbOTyuzjMkTaS93NiJHZ25PZ6OdGasjHK0nAmmt8XNarOe6yxFXzDoZJ42bfuBoEBRHpEAydPOKp2Ig0ZB','rmsG6wIZR5kGBnjSTpfJIwjeemwIeMLL8De6AogdtGl5wTZPA4kTtR7X5wpjIAxIGbPIN5n9LZEHufa4cIPTePsjLhJXjGprjE9yBxzZWDiGl9CDReax3QZGzsni0S')
...
2020-09-30T04:04:12.548392Z	  258 Quit	
2020-09-30T04:04:12.551025Z	  256 Query	SELECT intcol1,intcol2,charcol1,charcol2,charcol3 FROM t1
2020-09-30T04:04:12.553800Z	  256 Query	INSERT INTO t1 VALUES (2126558185,773273718,'Y88N07to033m2XEIzHzMJsHuXTL2GeCheC4WJqIClDqol4ycMpqZh7K4cZytBBQhNMBb4LnqadWBZSfvITLzdZw56uqH5GqTftwj6jZYC3klONZalmPEJLJPGAaLIO','ip9eZFDynPuN3AnSkOE9ePXxinzG0IYjzhLYobNbs9znJeFv2L4YmRTS6Lc7X0qWZ3vLWApFJo2WIAPKXLsIhDenQ7ux7cKhYFu2Pj9cNCyhMFtlSd39raxHhj7gKR','Dsa0mrjwR70PgEYaz0BvAuLz4uiBa2Wgm4gPvFDEMDXvR3TI3gD5RQ4XKnivhCRK87l3My9d3gYMbtgePmcsCgNZRxK11nL9m640wDTzltLKm1r4fRws7CHR9TSBGp')
2020-09-30T04:04:12.577573Z	  249 Query	DROP SCHEMA IF EXISTS `mysqlslap`
```

```
Benchmark
	Average number of seconds to run all queries: 1.172 seconds
	Minimum number of seconds to run all queries: 1.056 seconds
	Maximum number of seconds to run all queries: 1.288 seconds
	Number of clients running queries: 5       # 每个连接查询5次，共25次
	Average number of queries per client: 0
```

## 案例3
- 从文件读取
`mysqlslap --concurrency=5 --iterations=5 --query=query.sql --create=create.sql --delimiter=";"`

## 