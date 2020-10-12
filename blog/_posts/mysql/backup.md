## mysqldump
- 基础备份: `shell> mysqldump --single-transaction --master-data db_name > backup-file.sql`
- 基础还原: `shell> mysql -e "source /path-to-backup/backup-file.sql" db_name`
- 远程还原: `shell> mysqldump db_name | mysql --host=remote_host -C db_name`