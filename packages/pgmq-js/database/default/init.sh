#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$DBUSER_PWD"
# Execute with the normal user
echo 100
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB \
  -f ddl/extension_user.sql \

echo 101
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB \
  -f ddl/tb_queue_meta.sql \

echo 102
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB \
  -f ddl/tb_route.sql \


echo 103
export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB \
  -f ddl/init-privilege.sql \
  -f ddl/extension.sql \

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\dt+ pgmq.*"
