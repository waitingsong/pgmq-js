#!/bin/bash
set -e

psql -V
# netstat -tunpl
dig postgres

export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq -f $cwd/.scripts/ci/init-pre.sql
echo -e "\n"


SQL_DIR="$cwd/packages/pgmq-js/database/"
cd "$SQL_DIR"
. ./init-db.sh

export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -f $cwd/.scripts/ci/init-post.sql

