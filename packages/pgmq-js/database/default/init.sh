#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$DBUSER_PWD"
# Execute by the normal user
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB -bq -f ddl/extension_user.sql
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB -c "SELECT schema_name FROM information_schema.schemata WHERE catalog_name = 'db_ci_test';"

export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq  \
  -f ddl/extension.sql \
  -f ddl/tb_queue_meta.sql \
  -f ddl/tb_route.sql \
  -f ddl/init-privilege.sql \
  -f ddl/ci-config.sql \

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\dt+ pgmq.*"

