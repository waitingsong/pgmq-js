
\l;
\d+;
\du+;
SELECT e.extname AS extension_name, \
  n.nspname AS schema_name, r.rolname AS owner FROM pg_extension e \
  JOIN pg_authid r ON e.extowner = r.oid JOIN pg_catalog.pg_namespace n ON n.oid = e.extnamespace;

