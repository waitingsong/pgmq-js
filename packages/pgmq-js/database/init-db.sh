#!/bin/bash
set -e

echo -e "\n"

SQL_DIR='default'
cd "$SQL_DIR"
. ./init.sh
cd -


psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\d+"
psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U$POSTGRES_USER -d $POSTGRES_DB -c "\dt+ pgmq.*"

