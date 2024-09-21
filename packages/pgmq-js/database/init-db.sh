#!/bin/bash
set -e

echo -e "\n"
PGPASSWORD="$PGMQ_PASSWORD"
echo "\l" | psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d postgres


SQL_DIR='default'
cd "$SQL_DIR"
. ./init.sh
cd -


psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d $PGMQ_DB -c "\d+"

