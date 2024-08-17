import type { DbConnectionConfig, DbConfig } from './types.js'


export const initDbConnectionConfig: DbConnectionConfig = {
  host: process.env['POSTGRES_HOST'] ? process.env['POSTGRES_HOST'] : 'localhost',
  port: process.env['POSTGRES_PORT'] ? +process.env['POSTGRES_PORT'] : 5432,
  database: process.env['POSTGRES_DB'] ? process.env['POSTGRES_DB'] : 'postgres',
  user: process.env['POSTGRES_USER'] ? process.env['POSTGRES_USER'] : 'postgres',
  password: process.env['POSTGRES_PASSWORD'] ? process.env['POSTGRES_PASSWORD'] : '',
  statement_timeout: 6000, // in milliseconds
}

export const initDbConfigPart: Omit<DbConfig, 'connection'> = {
  client: 'pg',
  pool: {
    min: 0,
    max: 100,
    // propagateCreateError: false,
  },
  acquireConnectionTimeout: 30000,
}

