#!/bin/bash
set -e

echo -e "\n"

PGPASSWORD="$PGMQ_PASSWORD"
psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d $PGMQ_DB -bq \
  -f ddl/extension.sql \
  -f ddl/tb_queue_meta.sql \


