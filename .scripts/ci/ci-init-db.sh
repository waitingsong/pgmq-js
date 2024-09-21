#!/bin/bash
set -e

psql -V
# netstat -tunpl
dig postgres

PGPASSWORD="$PGMQ_PASSWORD"
psql -h $PGMQ_HOST -p $PGMQ_PORT -U$PGMQ_USER -d $PGMQ_DB -c "SHOW TIMEZONE;"

echo -e "\n"


SQL_DIR="$cwd/packages/pgmq-js/database/"
cd "$SQL_DIR"
. ./init-db.sh

cd "$cwd"

