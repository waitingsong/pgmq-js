#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$DBUSER_PWD"
psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d $PGMQ_DB -bq \
  -f ddl/ci-config.sql \
  -f ddl/extension.sql \
  -f ddl/tb_queue_meta.sql \
  -f ddl/tb_route.sql \


