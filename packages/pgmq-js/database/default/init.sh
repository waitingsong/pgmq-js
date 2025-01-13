#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$DBUSER_PWD"
echo PGPASSWORD: $PGPASSWORD
echo DB: $POSTGRES_DB
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $DB_USER -d $POSTGRES_DB \
  -f ddl/extension.sql \

echo 10
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $DB_USER -d $POSTGRES_DB \
  -f ddl/tb_queue_meta.sql \

echo 11
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $DB_USER -d $POSTGRES_DB \
  -f ddl/tb_route.sql \


echo 333
export PGPASSWORD="$POSTGRES_PWD"
echo PGPASSWORD: $PGPASSWORD
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB \
  -f ddl/init-privilege.sql \

