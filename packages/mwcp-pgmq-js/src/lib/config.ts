import type { DbConfig, MiddlewareConfig, MiddlewareOptions } from './types.js'


export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export const initDbConfig: DbConfig = {
  client: 'pg',
  connection: {
    host: process.env['PGMQ_HOST'] ? process.env['PGMQ_HOST'] : 'localhost',
    port: process.env['PGMQ_PORT'] ? +process.env['PGMQ_PORT'] : 5432,
    database: process.env['PGMQ_DB'] ? process.env['PGMQ_DB'] : 'db_ci_test',
    user: process.env['PGMQ_USER'] ? process.env['PGMQ_USER'] : 'postgres',
    password: process.env['PGMQ_PASSWORD'] ? process.env['PGMQ_PASSWORD'] : '',
    statement_timeout: 10000, // in milliseconds
  },
  pool: {
    min: 0,
    max: 100,
    // propagateCreateError: false,
  },
  acquireConnectionTimeout: 30000,
}

