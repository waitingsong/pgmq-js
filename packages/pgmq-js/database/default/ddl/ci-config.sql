GRANT USAGE ON SCHEMA pgmq TO dbuser;
GRANT SELECT ON ALL TABLES IN SCHEMA pgmq TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA pgmq GRANT SELECT ON TABLES TO dbuser;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA pgmq TO dbuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA pgmq GRANT INSERT, UPDATE, DELETE ON TABLES TO dbuser;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgmq TO dbuser;

ALTER SYSTEM SET pg_partman_bgw.dbname = 'postgres,db_ci_test';
ALTER SYSTEM SET pg_partman_bgw.interval = 7200; -- default 3600(1 hour)
SELECT pg_reload_conf();

SHOW pg_partman_bgw.dbname;
SHOW pg_partman_bgw.interval;
SHOW max_locks_per_transaction;

-- SET search_path TO "$user", public, pgmq;

