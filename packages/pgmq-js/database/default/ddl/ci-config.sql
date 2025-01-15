ALTER SYSTEM SET pg_partman_bgw.dbname = 'postgres,db_ci_test';
ALTER SYSTEM SET pg_partman_bgw.interval = 3600; -- default 3600(1 hour)
SELECT pg_reload_conf();

SHOW pg_partman_bgw.dbname;
SHOW pg_partman_bgw.interval;
SHOW max_locks_per_transaction;

-- SET search_path TO "$user", public, pgmq;

