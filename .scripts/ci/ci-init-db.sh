#!/bin/bash
set -e

psql -V
# netstat -tunpl
dig postgres

echo $DBUSER
echo $DBUSER_PWD

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "SHOW TIMEZONE;"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -c "CREATE USER dbuser WITH PASSWORD 'dbuser';"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -c "\du+;"
# psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -c "SELECT usename, usecreatedb, usesuper, userepl, usebypassrls, valuntil, useconfig FROM pg_catalog.pg_user;"
echo 11
echo -e "\n"


SQL_DIR="$cwd/packages/pgmq-js/database/"
cd "$SQL_DIR"
. ./init-db.sh

export PGPASSWORD="$PGPASSWORD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "SELECT extname, extversion FROM pg_extension;"
echo "\l" | psql -h $POSTGRES__HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d postgres
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"
cd "$cwd"

