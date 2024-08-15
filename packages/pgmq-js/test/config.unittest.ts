import { initDbConfig } from '##/lib/config.js'
import type { DbConfig as Config } from '##/lib/types.js'


export const dbConfig: Config = {
  ...initDbConfig,
}
if (dbConfig.connection) {
  dbConfig.connection.database = 'db_ci_test'
  if (! dbConfig.connection.password) {
    // docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 quay.io/tembo/pgmq-pg:latest
    dbConfig.connection.password = 'password'
  }
}

