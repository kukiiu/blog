# binlog用法

`mysqlbinlog binlog.000001`
`mysqlbinlog binlog.000001 -vv`


## 注意事项
There are several reasons why a client might want to set binary logging on a per-session basis:
• A session that makes many small changes to the database might want to use row-based logging.
• A session that performs updates that match many rows in the WHERE clause might want to use
statement-based logging because it will be more efficient to log a few statements than many rows.
• Some statements require a lot of execution time on the source, but result in just a few rows being
modified. It might therefore be beneficial to replicate them using row-based logging.
There are exceptions when you cannot switch the replication format at runtime:
• The replication format cannot be changed from within a stored function or a trigger.
• If the NDB storage engine is enabled.
• If a session has open temporary tables, the replication format cannot be changed for the session (SET
@@SESSION.binlog_format).
• If any replication channel has open temporary tables, the replication format cannot be changed globally
(SET @@GLOBAL.binlog_format or SET @@PERSIST.binlog_format).
• If any replication channel applier thread is currently running, the replication format cannot be changed
globally (SET @@GLOBAL.binlog_format or SET @@PERSIST.binlog_format).

To change the format safely, you must stop replication and ensure that the same change is made on both the source and the replica.

impossible to write to binary log since BINLOG_FORMAT = STATEMENT and at least one table uses a storage engine limited to row-based logging. InnoDB is limited to row-logging when transaction isolation level is READ COMMITTED or READ UNCOMMITTED