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
    host: process.env['POSTGRES_HOST'] ? process.env['POSTGRES_HOST'] : 'localhost',
    port: process.env['POSTGRES_PORT'] ? +process.env['POSTGRES_PORT'] : 5432,
    database: process.env['POSTGRES_DB'] ? process.env['POSTGRES_DB'] : 'db_ci_test',
    user: process.env['POSTGRES_USER'] ? process.env['POSTGRES_USER'] : 'postgres',
    password: process.env['POSTGRES_PASSWORD'] ? process.env['POSTGRES_PASSWORD'] : '',
    statement_timeout: 10000, // in milliseconds
  },
  pool: {
    min: 0,
    max: 100,
    // propagateCreateError: false,
  },
  acquireConnectionTimeout: 30000,
}

