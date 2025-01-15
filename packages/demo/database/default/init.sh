#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq \
  -f ddl/ci-config.sql \
  -f ddl/tb_user.sql \

export PGPASSWORD="$DBUSER_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB \
  -f ddl/tb_user_insert.sql \

