
import type { DbConfig, DbConnectionConfig } from './types.js'


export const initDbConnectionConfig: DbConnectionConfig = {
  host: process.env['PGMQ_HOST'] ? process.env['PGMQ_HOST'] : 'localhost',
  port: process.env['PGMQ_PORT'] ? +process.env['PGMQ_PORT'] : 5432,
  database: process.env['PGMQ_DB'] ? process.env['PGMQ_DB'] : 'postgres',
  user: process.env['PGMQ_USER'] ? process.env['PGMQ_USER'] : 'postgres',
  password: process.env['PGMQ_PASSWORD'] ? process.env['PGMQ_PASSWORD'] : 'postgres',
  // statement_timeout: 6000, // in milliseconds
}

export const initDbConfigPart: Omit<DbConfig, 'connection'> = {
  client: 'pg',
  pool: {
    min: 0,
    max: 100,
    // propagateCreateError: false,
    // afterCreate: (conn: any, done: any) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //   conn.query('SET search_path TO pgmq, public;', (err: unknown) => {
    //     if (err) {
    //       // first query failed,
    //       // return error and don't try to make next query
    //       done(err, conn)
    //       return
    //     }
    //     done(null, conn)
    //   })
    // },
  },
  acquireConnectionTimeout: 30000,
}

