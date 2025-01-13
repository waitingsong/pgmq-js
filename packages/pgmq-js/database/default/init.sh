#!/bin/bash
set -e

echo -e "\n"

export PGPASSWORD="$DBUSER_PWD"
# Execute with the normal user
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB -bq -f ddl/extension_user.sql

export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq  -f ddl/init-privilege.sql

export PGPASSWORD="$DBUSER_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$DBUSER -d $POSTGRES_DB -bq \
  -f ddl/tb_queue_meta.sql \
  -f ddl/tb_route.sql \

export PGPASSWORD="$POSTGRES_PWD"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq \
  -f ddl/extension.sql \
  -f ddl/init-privilege.sql \

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\dt+ pgmq.*"

