#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$DBUSER_PWD"
echo 222
echo $DBUSER
echo $DBUSER_PWD
echo $PGPASSWORD
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DB_USER -d $POSTGRES_DB \
  # -f ddl/ci-config.sql \
  -f ddl/extension.sql \
  -f ddl/tb_queue_meta.sql \
  -f ddl/tb_route.sql \


