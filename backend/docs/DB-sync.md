# Database replication

## Create a dump

```sh
ssh staging-app "pg_dump webapp > ~/dump.sql"
```

After exiting your SSH session (`ctrl + D`), copy the dump SQL file locally

```sh
scp staging-app:dump.sql ~/dump.sql
```

You'll want to drop the existing local DB prior to loading the SQL dump

```
cd ~/Code/orcha/orcha-backend/
yarn typeorm schema:drop
```

You can now run the PSQL console and load the dump file

```sql
\i /Users/briceleroy/dump.sql
```
