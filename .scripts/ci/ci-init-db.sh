#!/bin/bash
set -e

psql -V
# netstat -tunpl
dig postgres

PGPASSWORD="$PGPASSWORD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "SHOW TIMEZONE;"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "CREATE USER $DBUSER WITH PASSWORD '$DBPASSWORD';"
echo -e "\n"


SQL_DIR="$cwd/packages/pgmq-js/database/"
cd "$SQL_DIR"
. ./init-db.sh

PGPASSWORD="$PGPASSWORD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "SELECT extname, extversion FROM pg_extension;"
echo "\l" | psql -h $POSTGRES__HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d postgres
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"
cd "$cwd"

