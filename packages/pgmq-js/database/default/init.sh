#!/bin/bash
set -e

echo -e "\n"

psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -bq \
  -f ddl/extension.sql \


